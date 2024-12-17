import { ChatView } from "../components/chat/Chat";
import { switchChat } from "../features/chat";
import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import { useParams, Navigate } from "react-router-dom";

export function ChatPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const chatId = params.chatId;
  const chat = useAppSelector((state) =>
    chatId ? state.chats.chats[chatId] : null
  );

  if (!chatId) {
    dispatch(switchChat({ id: null }));
    return <Navigate to={"/"} />;
  }

  if (!chat) {
    dispatch(switchChat({ id: null }));
    return <Navigate to={"/"} />;
  }

  return <ChatView chat={chat} />;
}
