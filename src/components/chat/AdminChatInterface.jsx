import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ArrowDown } from "lucide-react";
import { fetchMessages } from "../../redux/message/messageThunks";
import {
  connectSocket,
  getSocket,
  ensureSocketConnected,
} from "../../utils/api/socket";
import { addMessage } from "../../redux/message/messageSlice";
import { fetchAllClients } from "../../redux/client/clientThunks";
import useSocketEvents from "../../utils/hooks/useSocketEvents";

// Get the API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Path to notification sound
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3";
// Flag to track if audio has been initialized by user interaction
let audioInitialized = false;

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

const AdminChatInterface = ({ client }) => {
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
        dispatch(fetchAllClients());
      }
    });

    socket.on("connect", () => {
      // Refresh data on reconnect to ensure we have the latest
      if (client && user?.id) {
        setSilentReload(true);
        dispatch(
          fetchMessages({
            clientId: client._id,
            // Only include agentId if it exists
            ...(client.assignedAgent?._id && {
              agentId: client.assignedAgent._id,
            }),
            silent: true,
          })
        );
        dispatch(fetchAllClients());
      }
    });

    return () => {
      socket.off("clientUpdate");
      socket.off("connect");
    };
  }, [dispatch, user?.id, client]);

  // Use socket events hook to listen for new messages
  useSocketEvents({
    userId: user?.id,
    roomId: client?._id,
    listenForMessages: !!client,
    onNewMessage: (message) => {
      // Check if the message is related to our current client
      if (message.clientId === client?._id) {
        // Directly add the message to our Redux store
        dispatch(addMessage(message));
        // Play notification if message is from client
        if (message.sender === "client") {
          playNotificationSound();
        }
        // Auto-scroll to bottom when new message arrives
        setTimeout(scrollToBottom, 100);
      }
    },
  });

  // Fetch messages when client changes
  useEffect(() => {
    if (client?._id) {
      setSilentReload(false); // Reset silent reload flag when client changes
      setIsInitialLoad(true); // Set initial load flag to show loading UI
      dispatch(
        fetchMessages({
          clientId: client._id,
          // Only include agentId if it exists
          ...(client.assignedAgent?._id && {
            agentId: client.assignedAgent._id,
          }),
        })
      ).then(() => {
        setIsInitialLoad(false);
        setTimeout(scrollToBottom, 100);
      });
    }
  }, [client?._id, client?.assignedAgent?._id, dispatch]);

  // Handle scroll behavior for messages container
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Show scroll button when not at bottom
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  // Function to format date separators
  const getFormattedDateSeparator = (date) => {
    if (!date) return "";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);

    // Function to check if dates are the same day
    const isSameDay = (date1, date2) =>
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();

    if (isSameDay(messageDate, today)) {
      return "Today";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Yesterday";
    } else {
      // Format date as Month Day, Year
      return messageDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = useCallback(() => {
    const groups = [];
    let currentDate = null;
    let currentMessages = [];

    messages.forEach((message) => {
      if (!message.timestamp) return;

      const messageDate = new Date(message.timestamp);
      const dateString = messageDate.toLocaleDateString();

      if (dateString !== currentDate) {
        // If we have messages in the current group, add it to groups
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            formattedDate: getFormattedDateSeparator(
              new Date(currentMessages[0].timestamp)
            ),
            messages: currentMessages,
          });
        }

        // Start new group
        currentDate = dateString;
        currentMessages = [message];
      } else {
        // Add to current group
        currentMessages.push(message);
      }
    });

    // Add the last group if it has messages
    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        formattedDate: getFormattedDateSeparator(
          new Date(currentMessages[0].timestamp)
        ),
        messages: currentMessages,
      });
    }

    return groups;
  }, [messages]);

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
      {/* Header with client name and agent information */}
      <div className="p-3 flex items-center border-b border-gray-300">
        <div className="flex-1">
          <h2 className="text-lg font-medium">{`${client.firstName || ""} ${
            client.lastName || ""
          }`}</h2>
        </div>
        {client.language && (
          <div className="ml-auto px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
            {client.language.toUpperCase()}
          </div>
        )}
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto h-0"
        onScroll={handleScroll}
      >
        {/* Only show loading UI during initial load, not silent updates */}
        {loading && isInitialLoad && (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-400">
              Loading messages...
            </div>
          </div>
        )}

        {/* No messages placeholder */}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-gray-400">
              This is the beginning of the conversation with {client.firstName}.
            </p>
          </div>
        )}

        {/* Grouped messages by date */}
        {groupedMessages.map((group) => (
          <div key={group.date} className="mb-6">
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                {group.formattedDate}
              </div>
            </div>

            {/* Messages for this date */}
            {group.messages.map((message) => (
              <div
                key={message._id}
                className={`flex mb-4 ${
                  message.sender === "agent" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === "agent"
                      ? "bg-secondary text-white"
                      : "bg-gray-100 text-gray-800"
                  } ${message.isVoiceMessage ? "voice-message-bubble" : ""}`}
                >
                  <MessageContent message={message} />
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Scroll to bottom reference */}
        <div ref={messageEndRef} />
      </div>

      {/* Admin mode notice */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
        You are in admin view mode. Only viewing messages is allowed.
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 bg-white shadow-md rounded-full p-2 z-10"
        >
          <ArrowDown className="text-secondary" size={18} />
        </button>
      )}
    </div>
  );
};

export default AdminChatInterface;
