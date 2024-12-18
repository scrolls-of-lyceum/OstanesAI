import { createAsyncThunk, ThunkAction, AnyAction } from "@reduxjs/toolkit";
import {
  streamChatCompletion,
  prepareHistory,
  ChatCompletionError,
} from "../../lib/api/openai";
import { RootState } from "../../store";
import { ChatCompletionRequestMessage } from "openai";
import { chatsSlice } from ".";
import { ASSISTANT, USER, Chat, NEW_CHAT_DEFAULT, SYSTEM } from "./types";
import { selectChat } from "./selectors";
import { getApiConfiguration, selectApi } from "../settings/selectors";
import { createToast } from "../toasts/thunks";
import { CHATGPT_MODELS } from "../../lib/constants/openai";

export const streamCompletion = createAsyncThunk<
  void,
  string,
  { state: RootState }
>("chat/streamCompletion", async (id: string, thunkAPI) => {
  // alert("Done")

//HTTP REQUEST 

//  return 
  const state = thunkAPI.getState();
  let config: ReturnType<typeof getApiConfiguration> | undefined;
  try {
    config = getApiConfiguration(state);
  } catch (e) {
    thunkAPI.dispatch(
      createToast({
        message: "Please configure your API key in the settings",
        type: "error",
        duration: 3000,
      })
    );

    throw e;
  }
  const chat = selectChat(id)(state);

  if (!chat) {
    throw new Error("Chat not found");
  }
  try {
let data
    // connect to server
    const eventSource = new EventSource("http://172.30.214.252:3636/events");

      // Listen for messages from the server
      eventSource.onmessage = (event) => {


         data = JSON.parse(event.data);

        console.log("*****************************",data.res);
        

        thunkAPI.dispatch(
          
          chatsSlice.actions.typeCompletionMessage({
            id,
            message:  
             {
              role: "system",
              content:data?.res
            },  
          })
        );
      };
      
    
  } catch (e) {

    console.log("Error" , e);
    
  }
});

export const fetchSummary = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("chat/fetchSummary", async (id: string, thunkAPI) => {
  const state = thunkAPI.getState();
  const api = selectApi(state);

  const chat = selectChat(id)(state);
  if (!chat) {
    throw new Error("Chat not found");
  }

  const firstAssistantMessage = Object.values(chat.history).find(
    (h) => h.role === ASSISTANT
  );

  if (!firstAssistantMessage) {
    return NEW_CHAT_DEFAULT;
  }
  try {
    const tokenLimit = CHATGPT_MODELS[state.settings.model].tokens;
    const response = await api.createChatCompletion({
      messages: [
        ...prepareHistory(
          Object.values(chat.history).filter((m) => m.role !== SYSTEM),
          tokenLimit
        ),
        {
          role: USER,
          content: `Respond with title for this conversation. Use as few words as possible. Your entire response will be used as the title. If you don't want to set a title, respond with: "${NEW_CHAT_DEFAULT}" `,
        },
      ],
      model: "gpt-3.5-turbo-0301",
    });
    const summary = response.data.choices[0];

    let newTitle = summary?.message?.content;

    if (!newTitle) {
      return NEW_CHAT_DEFAULT;
    }

    newTitle = newTitle.replace(/title: /i, "").trim();
    // Replace " " if it is wrapped in quotes (e.g. "title") is the same as title
    newTitle = newTitle.replace(/^"(.*)"$/, "$1");

    return newTitle;
  } catch (e) {
    console.error(e);
    return NEW_CHAT_DEFAULT;
  }
});

export const pushHistory =
  (
    message: ChatCompletionRequestMessage
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState) => {
    let state = getState();
    const activeId = state.chats.activeId;
    if (activeId === null) {
      return;
    }

    let chat = selectChat(activeId)(state);

    if (!chat) {
      throw new Error("Chat not found");
    }

    dispatch(
      chatsSlice.actions.pushHistory({
        chatId: chat.id,
        segment: message,
      })
    );

    if (message.role === USER) {
      await dispatch(streamCompletion(chat.id));
      // We need to get the latest state here because the streamCompletion
      state = getState();
      chat = selectChat(activeId)(state);
      if (!chat) {
        return;
      }

      const isFirstAssistantMessage =
        Object.values(chat.history).filter((h) => h.role === ASSISTANT)
          .length === 1;

      if (isFirstAssistantMessage) {
        dispatch(fetchSummary(chat.id));
      }
    }
  };
