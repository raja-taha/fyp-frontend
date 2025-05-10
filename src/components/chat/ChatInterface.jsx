import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Send, ArrowDown, Mic, StopCircle } from "lucide-react";
import { sendMessage, fetchMessages } from "../../redux/message/messageThunks";
import {
  connectSocket,
  getSocket,
  ensureSocketConnected,
} from "../../utils/api/socket";
import { addMessage } from "../../redux/message/messageSlice";
import { fetchClients } from "../../redux/client/clientThunks";
import useSocketEvents from "../../utils/hooks/useSocketEvents";

// Get the API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Path to notification sound
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3";
// Flag to track if audio has been initialized by user interaction
let audioInitialized = false;

// Helper function to create a unique ID based on timestamp
const createTempId = (timestamp) => {
  const time = timestamp ? new Date(timestamp).getTime() : Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `temp-${time}-${random}`;
};

// Helper function to fix audio src paths in voice messages
const fixAudioSrcPath = (htmlContent) => {
  if (!htmlContent) return htmlContent;

  // Check if the HTML includes an audio tag with a src attribute starting with "/uploads"
  if (htmlContent.includes("<audio") && htmlContent.includes('src="/uploads')) {
    // Replace the src attribute to include the API base URL
    return htmlContent.replace(
      /src="(\/uploads\/[^"]+)"/g,
      `src="${API_BASE_URL}$1"`
    );
  }

  return htmlContent;
};

// Format the current date for display
const formatDate = (date) => {
  if (!date) return "";

  try {
    const now = new Date(date);
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  } catch (e) {
    console.error("Date formatting error:", e);
    return "";
  }
};

// Helper to render message content based on type
const MessageContent = ({ message }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  if (message.isVoiceMessage) {
    // For voice messages, first fix the audio src path, then use dangerouslySetInnerHTML
    const fixedHtml = fixAudioSrcPath(message.text);

    // For client messages with voice, handle translations
    const hasTranslation = message.translatedText && message.sourceLanguage;
    const textDiffers =
      hasTranslation && message.text !== message.translatedText;

    // Extract transcript from voice message HTML
    const transcriptMatch = message.text.match(
      /<div class="transcript">(.*?)<\/div>/
    );
    const transcript = transcriptMatch ? transcriptMatch[1].trim() : "";

    // Determine what text to display based on toggle state
    const displayText =
      message.sender === "agent"
        ? transcript
        : hasTranslation
        ? showOriginal
          ? transcript
          : message.translatedText
        : transcript;

    return (
      <div className="flex flex-col justify-between">
        {/* Audio player */}
        <div
          className="voice-message-container mb-2"
          dangerouslySetInnerHTML={{ __html: fixedHtml }}
        />

        {/* Text content (transcript or translation) */}
        <p className="text-wrap break-words hyphens-auto whitespace-pre-wrap">
          {displayText}
        </p>

        {/* Toggle button and timestamp */}
        <div className="flex justify-between items-center mt-1 gap-2">
          {/* Show toggle button if translation exists and texts are different */}
          <div>
            {textDiffers && message.sender === "client" && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`text-xs ${
                  message.sender === "agent" ? "text-blue-100" : "text-gray-500"
                } underline`}
              >
                {showOriginal ? "Show translation" : "Show original"}
              </button>
            )}
          </div>

          <div
            className={`text-xs mt-1 ${
              message.sender === "agent" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formatDate(message.timestamp)}
          </div>
        </div>
      </div>
    );
  } else {
    // For regular text messages with translation handling
    const hasTranslation = message.translatedText && message.sourceLanguage;
    const textDiffers =
      hasTranslation && message.text !== message.translatedText;

    const displayText =
      // If it's from agent, always show original text
      message.sender === "agent"
        ? message.text
        : // Otherwise for client messages with translation, show based on toggle
        hasTranslation
        ? showOriginal
          ? message.text
          : message.translatedText
        : message.text;

    return (
      <>
        <p className="text-wrap break-words hyphens-auto whitespace-pre-wrap">
          {displayText}
        </p>
        <div className="flex justify-between items-center mt-1 gap-2">
          {/* Show toggle button only if translation exists, message is from client, and texts are different */}
          <div>
            {textDiffers && message.sender === "client" && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`text-xs ${
                  message.sender === "agent" ? "text-blue-100" : "text-gray-500"
                } underline`}
              >
                {showOriginal ? "Show translation" : "Show original"}
              </button>
            )}
          </div>

          <div
            className={`text-xs mt-1 ${
              message.sender === "agent" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formatDate(message.timestamp)}
          </div>
        </div>
      </>
    );
  }
};

const ChatInterface = ({ client }) => {
  const [inputValue, setInputValue] = useState("");
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [silentReload, setSilentReload] = useState(false); // Flag for silent reloads
  const notificationSound = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.user);

  // Initialize audio on component mount
  useEffect(() => {
    // Initialize audio
    notificationSound.current = new Audio(NOTIFICATION_SOUND_PATH);

    // Set up event listeners for the audio element
    notificationSound.current.addEventListener("canplaythrough", () => {
      setAudioReady(true);
    });

    // Attempt to load the audio
    notificationSound.current.load();

    return () => {
      if (notificationSound.current) {
        notificationSound.current.removeEventListener("canplaythrough", () => {
          setAudioReady(false);
        });
      }
    };
  }, []);

  // Initialize audio on user interaction with the component
  useEffect(() => {
    const initializeAudio = () => {
      if (notificationSound.current && !audioInitialized) {
        // Try to play and immediately pause to initialize audio
        notificationSound.current.volume = 0;
        notificationSound.current
          .play()
          .then(() => {
            notificationSound.current.pause();
            notificationSound.current.currentTime = 0;
            notificationSound.current.volume = 1;
            audioInitialized = true;
          })
          .catch((err) => {
            console.log("Audio couldn't be initialized yet:", err);
          });
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", initializeAudio);
    document.addEventListener("keydown", initializeAudio);

    return () => {
      document.removeEventListener("click", initializeAudio);
      document.removeEventListener("keydown", initializeAudio);
    };
  }, [audioReady]);

  // Define scrollToBottom early so it can be referenced in other functions
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Only try to play if we have the audio element and it's been initialized
      if (notificationSound.current && audioReady) {
        // Reset the audio to the beginning
        notificationSound.current.currentTime = 0;

        // Attempt to play with user gesture
        const playPromise = notificationSound.current.play();

        // Handle play promise
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Error playing notification sound:", error);
            // Don't show this as an error since it's expected in some cases
          });
        }
      }
    } catch (error) {
      console.log("Failed to play notification sound:", error);
    }
  }, [audioReady]);

  // Connect to socket once and keep it connected
  useEffect(() => {
    // Connect to socket
    connectSocket();

    // Listen for global client updates - new clients, status changes, etc.
    const socket = getSocket();

    socket.on("clientUpdate", () => {
      if (user?.id) {
        setSilentReload(true);
        dispatch(fetchClients(user.id));
      }
    });

    socket.on("connect", () => {
      // Refresh data on reconnect to ensure we have the latest
      if (client && user?.id) {
        setSilentReload(true);
        dispatch(
          fetchMessages({
            clientId: client._id,
            agentId: user.id,
            silent: true,
          })
        );
        dispatch(fetchClients(user.id));
      }
    });

    return () => {
      // Cleanup event listeners but don't disconnect
      socket.off("clientUpdate");
      socket.off("connect");
    };
  }, [dispatch, user?.id, client]);

  // Listen for new messages specific to this client
  const handleNewMessage = useCallback(
    (newMessage) => {
      // Check if this message is for the current conversation
      if (
        (newMessage.clientId === client?._id &&
          newMessage.agentId === user?.id) ||
        (newMessage.clientId === client?._id && newMessage.sender === "client")
      ) {
        // Immediately add message to the state
        dispatch(addMessage(newMessage));

        // Immediately scroll to bottom when new message arrives
        requestAnimationFrame(() => {
          scrollToBottom();
        });

        // Play notification sound when receiving messages from client
        if (newMessage.sender === "client") {
          playNotificationSound();
        }
      }
    },
    [client, user, dispatch, playNotificationSound]
  );

  // Listen for specific notification about client activity
  const handleMessageNotification = useCallback(
    (notification) => {
      // If notification is related to the current client, refresh messages silently
      if (notification.clientId === client?._id) {
        setSilentReload(true);

        // Immediately fetch messages to update UI
        dispatch(
          fetchMessages({
            clientId: client._id,
            agentId: user.id,
            silent: true,
          })
        );

        // Play notification sound for incoming notifications
        playNotificationSound();
      }
    },
    [client, dispatch, user, playNotificationSound, setSilentReload]
  );

  // Connect to socket and join room for specific client
  useEffect(() => {
    if (!client || !user) return;

    // Get socket and make sure it's connected
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // Join room for this client
    const roomData = {
      userId: user.id,
      roomId: client._id,
    };
    socket.emit("joinRoom", roomData);

    // Remove any existing listeners to prevent duplicates
    socket.off("newMessage", handleNewMessage);
    socket.off("messageNotification", handleMessageNotification);

    // Add new listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageNotification", handleMessageNotification);

    // Fetch messages when switching to a new client
    dispatch(
      fetchMessages({
        clientId: client._id,
        agentId: user.id,
      })
    );

    return () => {
      // Only clean up listeners, don't leave the room
      socket.off("newMessage", handleNewMessage);
      socket.off("messageNotification", handleMessageNotification);
    };
  }, [client, dispatch, user, handleNewMessage, handleMessageNotification]);

  // Reset silent reload flag when loading completes
  useEffect(() => {
    if (!loading && silentReload) {
      setSilentReload(false);
    }
  }, [loading]);

  // Track if this is the initial load
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(); // <- Use instant scroll here
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [messages]);

  // Handle scroll detection to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !client) return;

    const messageText = inputValue.trim();
    const timestamp = new Date().toISOString();

    // Create temporary message for immediate display
    const tempMessage = {
      _id: createTempId(timestamp),
      text: messageText,
      sender: "agent",
      timestamp: timestamp,
      clientId: client._id,
      agentId: user.id,
      isVoiceMessage: false,
    };

    // Add message to UI immediately
    dispatch(addMessage(tempMessage));

    // Clear input right away for better UX
    setInputValue("");

    // Send message
    try {
      await dispatch(
        sendMessage({
          clientId: client._id,
          agentId: user.id,
          text: messageText,
          sender: "agent",
          timestamp: timestamp,
          isVoiceMessage: false,
        })
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Could add user-facing error notification here
    }
  };

  // Get formatted date for date separator (e.g., "Today", "Yesterday", or "MM/DD/YYYY")
  const getFormattedDateSeparator = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours to compare just the dates
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Format as MM/DD/YYYY
      const month = messageDate.getMonth() + 1;
      const day = messageDate.getDate();
      const year = messageDate.getFullYear();
      return `${month}/${day}/${year}`;
    }
  };

  // Filter out any invalid messages and remove duplicates
  const validMessages = useMemo(() => {
    // First filter out invalid messages
    const filteredMessages = messages.filter((msg) => msg && msg.text);

    // Then remove duplicates based on content and timestamps
    const uniqueMessages = [];
    const seenMessages = new Map();

    filteredMessages.forEach((message) => {
      // Create a unique key for each message using text, sender and approximate timestamp
      // Round timestamp to nearest second to account for small differences in temp vs saved messages
      const timestamp = message.timestamp
        ? new Date(message.timestamp).getTime()
        : 0;
      const roundedTimestamp = Math.floor(timestamp / 1000) * 1000;
      const messageKey = `${message.sender}-${roundedTimestamp}`; // Don't use text for voice messages as they have HTML

      // If we haven't seen this message before, or if we have a non-temp ID to replace a temp ID
      if (
        !seenMessages.has(messageKey) ||
        (message._id &&
          !message._id.startsWith("temp-") &&
          seenMessages.get(messageKey).startsWith("temp-"))
      ) {
        seenMessages.set(messageKey, message._id);
        uniqueMessages.push(message);
      }
    });

    return uniqueMessages;
  }, [messages]);

  // Group messages by date for date separators
  const groupMessagesByDate = useCallback(() => {
    const result = [];
    let currentDate = null;

    validMessages.forEach((message) => {
      if (!message.timestamp) return;

      const messageDate = new Date(message.timestamp);
      // Set to midnight for date comparison
      messageDate.setHours(0, 0, 0, 0);

      if (!currentDate || currentDate.getTime() !== messageDate.getTime()) {
        currentDate = messageDate;
        result.push({
          type: "dateSeparator",
          date: message.timestamp,
          id: `date-${message.timestamp}`,
        });
      }

      result.push({
        type: "message",
        message: message,
        id: message._id,
      });
    });

    return result;
  }, [validMessages]);

  // Get grouped messages
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate();
  }, [groupMessagesByDate]);

  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-600">
            Select a client to view messages
          </h3>
          <p className="text-gray-500 mt-2">
            Choose a client from the list on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-lg">
      {/* Simple header with just client name and back button */}
      <div className="p-3 flex items-center border-b border-gray-300">
        <h2 className="text-lg font-medium">{`${client.firstName || ""} ${
          client.lastName || ""
        }`}</h2>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {loading && !silentReload && groupedMessages.length === 0 ? (
          <div className="text-center py-4">
            <p>Loading messages...</p>
          </div>
        ) : groupedMessages.length > 0 ? (
          groupedMessages.map((item) => {
            if (item.type === "dateSeparator") {
              return (
                <div key={item.id} className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-4 py-1 rounded-full">
                    {getFormattedDateSeparator(item.date)}
                  </div>
                </div>
              );
            } else {
              const message = item.message;
              return (
                <div
                  key={item.id}
                  className={`mb-4 w-fit max-w-[80%] ${
                    message.sender === "agent" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`py-2 px-5 rounded-lg relative ${
                      message.sender === "agent"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                    } ${message.isVoiceMessage ? "voice-message-bubble" : ""}`}
                  >
                    <MessageContent message={message} />
                  </div>
                </div>
              );
            }
          })
        ) : (
          <p className="text-center text-gray-500 py-4">
            No messages yet. Start a conversation!
          </p>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-10 bg-gray-200 rounded-full p-2 shadow-md hover:bg-gray-300 transition-colors"
        >
          <ArrowDown size={20} className="text-gray-600" />
        </button>
      )}

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-300"
      >
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:cursor-pointer"
            disabled={!inputValue.trim()}
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
