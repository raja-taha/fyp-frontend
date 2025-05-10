import React from "react";
import { useSelector } from "react-redux";
import AdminChats from "./Admin/AdminChats";
import AgentChats from "./agent/AgentChats";

const Chats = () => {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="h-full">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      {user.role === "admin" && <AdminChats />}
      {user.role === "agent" && <AgentChats />}
    </div>
  );
};

export default Chats;
