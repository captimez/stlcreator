import React, { useState } from 'react';

const SettingsView = () => {
    const [directory, setDirectory] = useState('');

    const handleDirectoryChange = (event) => {
        setDirectory(event.target.value);
    };

    const handleSave = () => {
        // Save the directory to local storage or send it to the backend
        localStorage.setItem('stlDirectory', directory);
        alert('Directory saved successfully!');
    };

    return (
        <div>
            <h1>Settings</h1>
            <div>
                <label htmlFor="directory">STL Files Directory:</label>
                <input
                    type="text"
                    id="directory"
                    value={directory}
                    onChange={handleDirectoryChange}
                />
                <button onClick={handleSave}>Save</button>
            </div>
        </div>
    );
};

export default SettingsView;
