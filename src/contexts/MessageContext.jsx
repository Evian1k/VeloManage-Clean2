import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

const getAllConversations = () => {
  const conversations = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('autocare_messages_')) {
      const userId = key.replace('autocare_messages_', '');
      conversations[userId] = JSON.parse(localStorage.getItem(key) || '[]');
    }
  }
  return conversations;
};

const getAllUsers = () => {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('autocare_user_')) { // Assuming we store users like this, but we store one user
        // This part is tricky with the current auth setup. We'll mock it.
    }
  }
  // Mocking users who have sent messages
  return [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' }
  ];
};


export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState({});
  const [usersWithMessages, setUsersWithMessages] = useState([]);

  useEffect(() => {
    if (user?.isAdmin) {
      const allConvos = getAllConversations();
      setConversations(allConvos);
      
      // This is a simplified way to get users. A real app would have a user list.
      const userIds = Object.keys(allConvos);
      const mockUsers = userIds.map(id => ({
          id: id,
          name: `User ${id}`,
          email: `user${id}@example.com`
      }));
      setUsersWithMessages(mockUsers);

    } else if (user) {
      const savedMessages = localStorage.getItem(`autocare_messages_${user.id}`);
      setConversations({ [user.id]: savedMessages ? JSON.parse(savedMessages) : [] });
    } else {
      setConversations({});
    }
  }, [user]);

  const sendMessage = (text) => {
    if (!user || user.isAdmin) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    const userMessages = conversations[user.id] || [];
    const updatedMessages = [...userMessages, newMessage];
    const newConversations = { ...conversations, [user.id]: updatedMessages };
    setConversations(newConversations);
    localStorage.setItem(`autocare_messages_${user.id}`, JSON.stringify(updatedMessages));

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'admin',
        text: "Thanks for your message! An admin will review it shortly and get back to you.",
        timestamp: new Date().toISOString()
      };
      const messagesWithReply = [...updatedMessages, reply];
      const finalConversations = { ...conversations, [user.id]: messagesWithReply };
      setConversations(finalConversations);
      localStorage.setItem(`autocare_messages_${user.id}`, JSON.stringify(messagesWithReply));
    }, 1500);
  };

  const sendMessageToUser = (userId, text) => {
    if (!user || !user.isAdmin) return;

    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      text,
      timestamp: new Date().toISOString()
    };

    const userMessages = conversations[userId] || [];
    const updatedMessages = [...userMessages, newMessage];
    const newConversations = { ...conversations, [userId]: updatedMessages };
    setConversations(newConversations);
    localStorage.setItem(`autocare_messages_${userId}`, JSON.stringify(updatedMessages));
  };

  const value = {
    messages: user && !user.isAdmin ? conversations[user.id] || [] : [],
    conversations,
    usersWithMessages,
    sendMessage,
    sendMessageToUser,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};