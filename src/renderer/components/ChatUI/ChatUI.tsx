import React, { useState, useEffect, useRef, Fragment, useContext, KeyboardEvent } from "react";
import { BiSolidSend } from "react-icons/bi";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import Loading from "../Loading/Loading";
import styles from "./ChatUI.module.scss";

// Define types for messages
interface Message {
  role: "user" | "assistant";
  content: string;
  showMsg: string;
}
console.log(process.env.LOCAL_MODEL_PATH);

// Define props type
// interface ChatUIProps {
//   chat: unknown; // Adjust type based on the actual structure of `chat` if needed
// }

type ChatUIProps = {
  runModel: (...args: any[]) => any;
  onModelOutput: (...args: any[]) => any;
};

const ChatUI: React.FC<ChatUIProps> = ({runModel, onModelOutput}) => {
  const [input, setInput] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [output, setOutput] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage: Message = {
      role: "user",
      content: input,
      showMsg: input.trim()
    };

    // Add user message to chat
    setOutput((prev) => [...prev, userMessage]);
    setInput(""); // Clear input

    try {
      let prompt = ` 
        [History]:${output.map(
            (a) =>
              `${a.role === "user" ? "[User]" : "[Assistant]"}${a.content}. [endText] `
          )
          .join("")}
        \n[User]: ${input}. [endText] \n\n [Assistant]:`
      runModel(prompt)
        .catch(err => {
          setLoading(false);
          console.error("Error invoking model:", err);
      });
    } catch (error) {
      setLoading(false);
      console.error("Error invoking model:", error);
    } finally {
      // setLoading(false);
    }
  };


  useEffect(() => {
    // Listen for "model-output" events from the backend
    onModelOutput(data => {
      if (data) {
        if(data == "[endMsg]"){
          setLoading(false);
        } else{
          setOutput((prev) => {
            const newOutput = [...prev];
  
            if (newOutput.length && newOutput[newOutput.length - 1].role === "assistant") {
              const lastMsg = {
                ...newOutput[newOutput.length - 1],
                content: `${newOutput[newOutput.length - 1].content}${data}`,
                showMsg: `${newOutput[newOutput.length - 1].showMsg}${data}`,
              };
              newOutput[newOutput.length - 1] = lastMsg;
            } else {
              newOutput.push({
                role: "assistant",
                content: data,
                showMsg: data,
              });
            }
  
            return newOutput;
          });
        }
      }
    });

    return () => {
      window.api.onModelOutput(() => {}); // Replace with actual off logic if available
    };
  }, []);



  const handleEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default Enter behavior (e.g., adding a new line)
      handleSend();
    }
  };

  return (
    <div className={styles.chatUI}>
      <div className={styles.chatContainer}>
        {output.map((msg, index) => (
          <div
            key={index}
            className={styles.chatBox}
            style={{ textAlign: msg.role === "user" ? "right" : "left" }}
          >
            <div
              className={styles.chatContent}
              style={{
                background: msg.role === "user" ? "#007bff" : "#d1d1d1",
                color: msg.role === "user" ? "#fff" : "#000",
              }}
            >
              <Markdown remarkPlugins={[remarkBreaks]}>{msg.showMsg}</Markdown>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div className={styles.input}>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleEnter}
          placeholder={!loading ? "پیام شما..." : ""}
          disabled={loading}
        ></textarea>
        <button disabled={loading} onClick={handleSend}>
          <BiSolidSend />
        </button>
        {loading && (
          <div className={styles.loading}>
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUI;
