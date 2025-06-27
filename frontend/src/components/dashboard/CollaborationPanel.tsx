import React, { useState } from 'react';
import { MessageSquare, Users, Send, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system' | 'alert';
}

const CollaborationPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'System',
      content: 'Critical alert: APT-29 campaign detected',
      timestamp: '10:30 AM',
      type: 'system'
    },
    {
      id: '2',
      author: 'Sarah Chen',
      content: 'Investigating the APT-29 indicators. Initial analysis shows similar TTPs to previous campaigns.',
      timestamp: '10:32 AM',
      type: 'message'
    },
    {
      id: '3',
      author: 'Mike Johnson',
      content: 'I can assist with the network forensics. Already pulled logs from affected systems.',
      timestamp: '10:35 AM',
      type: 'message'
    },
    {
      id: '4',
      author: 'System',
      content: 'New ticket #INC-2024-0156 created for APT-29 investigation',
      timestamp: '10:37 AM',
      type: 'alert'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        author: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        type: 'message'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const getMessageStyle = (type: string, author: string) => {
    if (type === 'system') return 'bg-blue-900/20 border-blue-500/30 text-blue-300';
    if (type === 'alert') return 'bg-amber-900/20 border-amber-500/30 text-amber-300';
    if (author === 'You') return 'bg-slate-600 text-white ml-8';
    return 'bg-slate-700/50 text-slate-300';
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Team Collaboration</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">4 online</span>
            </div>
            <button className="p-1 text-slate-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg text-sm border ${getMessageStyle(message.type, message.author)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-xs">
                {message.author}
              </span>
              <span className="text-xs opacity-60">
                {message.timestamp}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Team Members */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Active:</span>
          <div className="flex space-x-2">
            {['SC', 'MJ', 'AL', 'RK'].map((initials, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-medium"
              >
                {initials}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;