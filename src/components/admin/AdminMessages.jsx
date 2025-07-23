import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AdminMessages = () => {
  const { user } = useAuth();
  const { conversations, sendMessageToUser, usersWithMessages } = useMessages();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (usersWithMessages.length > 0 && !selectedUser) {
      setSelectedUser(usersWithMessages[0]);
    }
  }, [usersWithMessages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversations, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      sendMessageToUser(selectedUser.id, newMessage);
      setNewMessage('');
    }
  };

  const currentMessages = selectedUser ? conversations[selectedUser.id] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-1"
      >
        <Card className="glass-effect border-red-900/30 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-white">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto space-y-2">
            {usersWithMessages.map((convUser) => (
              <div
                key={convUser.id}
                onClick={() => setSelectedUser(convUser)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                  selectedUser?.id === convUser.id ? 'bg-red-600/50' : 'hover:bg-white/10'
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">{convUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{convUser.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {conversations[convUser.id]?.slice(-1)[0]?.text || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-2"
      >
        <Card className="glass-effect border-red-900/30 h-full flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader className="border-b border-red-900/30">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white">{selectedUser.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pr-4 space-y-4 py-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-3 ${
                      message.sender === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white">{selectedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                        message.sender === 'admin'
                          ? 'bg-red-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'admin' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-red-600 text-white">A</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t border-red-900/30">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Reply to ${selectedUser.name}...`}
                    className="bg-black/50 border-red-900/50 text-white placeholder:text-gray-400"
                  />
                  <Button type="submit" className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <User className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white">Select a Conversation</h3>
              <p className="text-gray-400">Choose a user from the list to view messages.</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminMessages;