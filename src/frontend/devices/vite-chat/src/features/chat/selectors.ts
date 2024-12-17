import { RootState } from "../../store";
import { Chat } from "./types";

export const selectChat =
  (id: string) =>
  (state: RootState): Chat | undefined =>
    state.chats.chats[id];
