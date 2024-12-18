import { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/core";


function ConfigPanel() {
    const [config, setConfig] = useState({
        max_tokens: 512,
        temperature: 1.0,
        top_p: 0.9,
        context_length: 2048,
        active_model: '',
    });

    useEffect(() => {
        // Fetch current configuration from backend
        invoke('get_config').then(setConfig);
    }, []);

    const handleSave = () => {
        invoke('set_config', { new_config: config }).then(() =>
            alert('Configuration Saved!')
        );
    };

    return (
        <div>
            <h3>Model Configuration</h3>
            <label>
                Max Tokens:
                <input
                    type="number"
                    value={config.max_tokens}
                    onChange={(e) => setConfig({ ...config, max_tokens: +e.target.value })}
                />
            </label>
            <label>
                Temperature:
                <input
                    type="number"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: +e.target.value })}
                />
            </label>
            <label>
                Top-p:
                <input
                    type="number"
                    step="0.1"
                    value={config.top_p}
                    onChange={(e) => setConfig({ ...config, top_p: +e.target.value })}
                />
            </label>
            <label>
                Context Length:
                <input
                    type="number"
                    value={config.context_length}
                    onChange={(e) => setConfig({ ...config, context_length: +e.target.value })}
                />
            </label>
            <button onClick={handleSave}>Save Configuration</button>
        </div>
    );
}

export default ConfigPanel;