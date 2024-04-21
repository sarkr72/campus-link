import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";

const ConversationList = ({ chats, handleChatSelect }) => {
  const [showList, setShowList] = useState(false);

  const toggleList = () => {
    setShowList(!showList);
  };

  return (
    <div className="conversation-list">
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="conversation-toggle">
          Conversations
        </Dropdown.Toggle>
        <Dropdown.Menu show={showList}>
          {chats.map((chat, index) => (
            <Dropdown.Item
              key={`${chat.id}-${index}`}
              onClick={() => {
                handleChatSelect(chat);
                toggleList();
              }}
            >
              {chat.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ConversationList;
