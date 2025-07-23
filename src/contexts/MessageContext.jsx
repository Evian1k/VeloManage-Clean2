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

const getUsersFromMessages = () => {
  const users = [];
  const userList = JSON.parse(localStorage.getItem('autocare_message_users') || '[]');
  return userList;
};

const saveUserToMessageList = (user) => {
  const existingUsers = getUsersFromMessages();
  const userExists = existingUsers.find(u => u.id === user.id);
  
  if (!userExists) {
    const newUserList = [...existingUsers, {
      id: user.id,
      name: user.name,
      email: user.email
    }];
    localStorage.setItem('autocare_message_users', JSON.stringify(newUserList));
    return newUserList;
  }
  return existingUsers;
};


export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState({});
  const [usersWithMessages, setUsersWithMessages] = useState([]);

  const refreshUserList = () => {
    if (user?.isAdmin) {
      const messageUsers = getUsersFromMessages();
      setUsersWithMessages(messageUsers);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      const allConvos = getAllConversations();
      setConversations(allConvos);
      
      // Get users who have sent messages
      const messageUsers = getUsersFromMessages();
      setUsersWithMessages(messageUsers);

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

    // Save user to message list for admin view
    const updatedUserList = saveUserToMessageList(user);
    setUsersWithMessages(updatedUserList);

    // Only send auto-reply if this is the user's first message
    const isFirstMessage = userMessages.length === 0;
    if (isFirstMessage) {
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
    }
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
    
    // Update the admin's view of conversations
    if (user?.isAdmin) {
      const allConvos = getAllConversations();
      setConversations(allConvos);
    }
  };

  const value = {
    messages: user && !user.isAdmin ? conversations[user.id] || [] : [],
    conversations,
    usersWithMessages,
    sendMessage,
    sendMessageToUser,
    refreshUserList,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};