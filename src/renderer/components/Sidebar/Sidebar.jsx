import { useContext, useState } from 'react';
import AIContext from '../../context/AIContext';
import styles from "./Sidebar.module.scss";
import { newFolder } from '../../utils/templates';
import { charList } from '../../utils/characters';

function Sidebar() {

    const { folders, setFolders, setPrompt, currentChat, character,
        setCurrentChat, modelPath, setModelPath, 
        backendType, setBackendType
    } = useContext(AIContext);

  const handleNewFolder = () => {
    // console.log(charList[1]);
    
    setFolders((prev) => [...prev, newFolder(`folder ${prev.length + 1}`, charList[1])]);
  };

  const handleExpandedFolder = (folderIndex) => {
    setFolders((prev) => {
        const newFolders = [...prev];
        const isopen = newFolders[folderIndex].open
        newFolders[folderIndex].open = !isopen;
        return newFolders;
    })
    
  }

  const handleNewChat = (folderIndex) => {
      setFolders((prev) => {
          const newFolders = [...prev];
          newFolders[folderIndex].chats.push({ title: `Chat ${newFolders[folderIndex].chats.length + 1}`, history: [] });
          return newFolders;
      });
      setCurrentChat([folderIndex, folders[folderIndex].chats.length - 1]);
  };

  const handleSelectChat = (folderIndex, chatIndex) => {
      setCurrentChat([folderIndex, chatIndex]);
  };

  const handleDeleteChat = (folderIndex, chatIndex) => {
      setFolders((prev) => {
          const newFolders = [...prev];
          newFolders[folderIndex].chats.splice(chatIndex, 1);

          if(!newFolders[folderIndex].chats.length){
            newFolders.splice(folderIndex, 1)
          }
          return newFolders;
      });
  };


    return (
        <div className={styles.sideBar} >
            <div className={styles.manager}>
                <h3>گفتگو‌ها</h3>
                <button onClick={handleNewFolder} style={{ marginBottom: '10px' }}>
                    + پوشه‌ی نو
                </button>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                    {folders.map((folder, folderIndex) => (
                        <li key={folderIndex}>
                            <div
                                onClick={() =>handleExpandedFolder(folderIndex)}
                                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {folder.name}
                            </div>
                            {folder.open && (
                                <ul style={{ listStyle: 'none', paddingLeft: '20px' }}>
                                    {folder.chats.map((chat, chatIndex) => (
                                        <li
                                            key={chatIndex}
                                            onClick={() => handleSelectChat(folderIndex, chatIndex)}
                                            style={{ cursor: 'pointer', padding: '5px' }}
                                        >
                                            {chat.title}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteChat(folderIndex, chatIndex);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'red',
                                                    marginLeft: '10px',
                                                }}
                                            >
                                                ✖
                                            </button>
                                        </li>
                                    ))}

                                    <li>
                                        <button
                                                onClick={()=>handleNewChat(folderIndex)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'red',
                                                    marginLeft: '10px',
                                                }}
                                            >
                                                new chat
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.character}>
                <img src={folders[currentChat[0]].character.avatar} />
            </div>
        </div>
    );
}

export default Sidebar;
