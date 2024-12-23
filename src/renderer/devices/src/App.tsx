import React from "react";
import ChatUI from "../../components/ChatUI/ChatUI";
import "./App.scss";

const App = (): JSX.Element => {

  const runModel = async (prompt, _callback)=>{
      const response = await fetch("http://172.30.214.245:3636/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        console.error("Failed to send message:", await response.text());
      }
  }



  const onModelOutput = (_callback)=>{

    const eventSource = new EventSource("http://172.30.214.245:3636/events");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data).res;
      _callback(data);
    }

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close(); // Close the connection if an error occurs
    };
  }

  

  return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div className="chatArea" >
            <ChatUI runModel={runModel} onModelOutput={onModelOutput} />
            </div>
        </div>
  );
};

export default App;
