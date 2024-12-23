import React from "react";
import ChatUI from "../../components/ChatUI/ChatUI";
import "./App.scss";

const App = (): JSX.Element => {

  const runModel = async (prompt, _callback)=>{
    const backendType = "cpu";
    const modelPath = "/media/shahrooz/Data/models/aya-expanse-8b-Q4_K_M.gguf";
    window.api.runModel(backendType, modelPath, prompt)
}

  return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div className="chatArea" >
                <ChatUI runModel={runModel} onModelOutput={window.api.onModelOutput} />
            </div>
        </div>
  );
};

export default App;
