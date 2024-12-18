import ChatUI from "./components/ChatUI/ChatUI";
import "./App.scss";

const App = (): JSX.Element => {

  return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div className="chatArea" >
                <ChatUI />
            </div>
        </div>
  );
};

export default App;
