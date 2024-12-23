import { invoke } from "@tauri-apps/api/core";


function ModelManager() {
    const [modelURL, setModelURL] = React.useState('');
    const [message, setMessage] = React.useState('');

    const handleDownload = async () => {
        try {
            const response = await invoke('download_model', { 
                model_url: modelURL, 
                model_name: 'model.bin' 
            });
            setMessage(response);
        } catch (err) {
            setMessage('Error downloading model: ' + err);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Model URL" 
                value={modelURL} 
                onChange={(e) => setModelURL(e.target.value)} 
            />
            <button onClick={handleDownload}>Download Model</button>
            <p>{message}</p>
        </div>
    );
}

export default ModelManager;