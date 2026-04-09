import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, MessageCircle, MoreVertical, Send, Check, CheckCheck, Smile, Image as ImageIcon, Paperclip, X, Phone, Video, Flag, Mic, Plus, Camera, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
  image?: string;
}

interface ChatSession {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();
  const { userProfile, t } = useChallenge();
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for chat sessions
  const [sessions] = useState<ChatSession[]>([
    {
      id: 1,
      username: 'Sarah_X',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+cool+Gen+Z+girl+with+neon+highlights&image_size=square',
      lastMessage: 'Always ready! Setting my Top 5 now.',
      time: 'now',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: 3,
      username: 'Ghost_Walker',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+mysterious+man+with+hoodie&image_size=square',
      lastMessage: 'Gonna smash that next post 🔥',
      time: '1h ago',
      unreadCount: 0,
      isOnline: false,
    },
  ]);

  // Handle direct navigation from Profile/Post
  useEffect(() => {
    if (routeUsername) {
      const existingSession = sessions.find(s => s.username === routeUsername || s.username.startsWith(routeUsername));
      if (existingSession) {
        setSelectedChat(existingSession);
      } else {
        // Create a temporary session for a new user
        setSelectedChat({
          id: Date.now(),
          username: routeUsername,
          avatar: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Profile+avatar+for+${routeUsername}&image_size=square`,
          lastMessage: '',
          time: 'now',
          unreadCount: 0,
          isOnline: true
        });
      }
    }
  }, [routeUsername, sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat]);

  const emojiCategories = [
    { 
      name: 'Smileys', 
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'] 
    },
    { 
      name: 'Gestures', 
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'] 
    },
    { 
      name: 'Symbols', 
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗️', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '✖️', '➗', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'] 
    },
    { 
      name: 'Flags', 
      emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴', '🏴', '🏴', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'] 
    }
  ];

  const addEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const [activeEmojiCategory, setActiveEmojiCategory] = useState(emojiCategories[0].name);

  // State for messages per user
  const [messagesData, setMessagesData] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved messages', e);
      }
    }
    return {
      'Sarah_X': [
        { id: 1, sender: 'Sarah_X', text: 'Hey! Are you ready for the challenge?', time: '10:30 AM', isMe: false, status: 'read' },
        { id: 2, sender: 'Me', text: 'Always ready! Setting my Top 5 now.', time: '10:32 AM', isMe: true, status: 'read' },
      ]
    };
  });

  // Save to localStorage whenever messagesData changes
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messagesData));
  }, [messagesData]);

  const currentUsername = selectedChat?.username || '';
  const messages = messagesData[currentUsername] || [
    { id: Date.now(), sender: 'System', text: `Start your conversation with @${currentUsername}`, time: '', isMe: false, status: 'read' }
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentUsername) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'Me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
    };

    setMessagesData(prev => ({
      ...prev,
      [currentUsername]: [...(prev[currentUsername] || []), newMessage]
    }));
    
    setMessageInput('');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUsername) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMessage: ChatMessage = {
          id: Date.now(),
          sender: 'Me',
          text: 'Sent an image',
          image: reader.result as string,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: 'sent',
        };
        
        setMessagesData(prev => ({
          ...prev,
          [currentUsername]: [...(prev[currentUsername] || []), newMessage]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* List View */}
      <div className={cn(
        "flex flex-col h-full transition-transform duration-300",
        selectedChat ? "-translate-x-full" : "translate-x-0"
      )}>
        <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/nav-chat-v3.png" alt="" className="h-8 w-8 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
              <img src="/nav-message-text-v2.png" alt="Messages" className="h-[20px] object-contain" style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }} />
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </header>

        <div className="p-4 bg-white sticky top-14 z-10">
          <div className="flex items-center gap-3 bg-zinc-100 px-4 py-2.5 rounded-2xl border border-zinc-200 focus-within:bg-white focus-within:border-purple-300 transition-all">
            <Search size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search survivors..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <button 
              key={session.id}
              onClick={() => {
                setSelectedChat(session);
                navigate(`/chat/${session.username.replace('😉', '')}`);
              }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 relative"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-100 shadow-sm">
                  <img src={session.avatar} alt={session.username} className="w-full h-full object-cover" />
                </div>
                {session.isOnline && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-black text-zinc-900 truncate tracking-tight">@{session.username}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{session.time}</span>
                </div>
                <p className={cn(
                  "text-sm truncate",
                  session.unreadCount > 0 ? "text-zinc-900 font-bold" : "text-zinc-500 font-medium"
                )}>
                  {session.lastMessage}
                </p>
              </div>
              {session.unreadCount > 0 && (
                <div className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                  {session.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selectedChat && (
        <div className="absolute inset-0 flex flex-col z-40 bg-white shadow-2xl pb-[60px]">
          {/* Header matching Sarah_X screenshot */}
          <header className="px-4 h-16 flex items-center justify-between sticky top-0 z-20 bg-white/80 text-zinc-900 border-b border-zinc-100 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedChat(null); navigate('/chat'); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-zinc-900" />
              </button>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-100">
                    <img src={selectedChat.avatar} alt={selectedChat.username} className="w-full h-full object-cover" />
                  </div>
                  {selectedChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight">{selectedChat.username}</span>
                  <div className="flex items-center gap-1.5">
                    {selectedChat.isOnline && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                      {selectedChat.isOnline ? 'ACTIVE NOW' : 'Active recently'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
            <div className="text-center py-4 mb-4">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Today</span>
            </div>
            {messages.map((msg, index) => {
              const isLastInGroup = index === messages.length - 1 || messages[index + 1].isMe !== msg.isMe;
              return (
                <div key={msg.id} className={cn("flex flex-col space-y-0.5", msg.isMe ? "ml-auto items-end" : "items-start")}>
                  {msg.image ? (
                    <div 
                      onClick={() => setFullscreenImage(msg.image || null)}
                      className="rounded-2xl overflow-hidden border-4 border-white shadow-md max-w-[85%] mt-2 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <img src={msg.image} alt="Sent" className="max-w-full h-auto object-cover max-h-[300px]" />
                    </div>
                  ) : (
                    <div className={cn(
                      "px-4 py-2.5 text-[15px] font-medium shadow-sm transition-all duration-300 max-w-[85%]",
                      msg.isMe 
                        ? "bg-[#8A76D6] text-white rounded-[20px] rounded-br-md" 
                        : "bg-[#F4F4F5] text-zinc-900 rounded-[20px] rounded-bl-md",
                      !isLastInGroup && (msg.isMe ? "rounded-br-[20px]" : "rounded-bl-[20px]")
                    )}>
                      {msg.text}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="bg-white border-t border-zinc-100 animate-in slide-in-from-bottom-2 duration-200">
              {/* Category Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-zinc-50 overflow-x-auto scrollbar-hide">
                {emojiCategories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveEmojiCategory(cat.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                      activeEmojiCategory === cat.name 
                        ? "bg-purple-600 text-white" 
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
                <button 
                  onClick={() => setShowEmojiPicker(false)}
                  className="ml-auto p-1.5 hover:bg-zinc-100 rounded-full"
                >
                  <X size={14} className="text-zinc-400" />
                </button>
              </div>

              {/* Emoji Grid */}
              <div className="h-48 overflow-y-auto p-3 grid grid-cols-8 gap-1 scrollbar-hide">
                {emojiCategories.find(c => c.name === activeEmojiCategory)?.emojis.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl p-2 hover:bg-zinc-50 rounded-xl transition-all active:scale-75 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar matching screenshot exactly */}
          <div className="p-3 pb-8 bg-white border-t border-zinc-100">
            <div className="flex items-center gap-2 max-w-5xl mx-auto">
              
              <div className="flex-1 flex items-center gap-3 px-4 h-11 rounded-full transition-all bg-zinc-100 text-zinc-900">
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="bg-transparent border-none outline-none text-[15px] flex-1 placeholder:text-zinc-400"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onFocus={() => setShowEmojiPicker(false)}
                />
                <div className="flex items-center gap-3 shrink-0">
                  {!messageInput.trim() ? (
                    <>
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile size={20} className={cn("cursor-pointer hover:opacity-100", showEmojiPicker ? "text-purple-600" : "text-zinc-400")} />
                      </button>
                      <ImageIcon size={20} className="cursor-pointer text-zinc-400 hover:opacity-100" onClick={() => fileInputRef.current?.click()} />
                    </>
                  ) : (
                    <button onClick={() => handleSendMessage()} className="font-bold text-sm px-1 active:scale-90 transition-all text-purple-600">Send</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <header className="p-4 flex items-center justify-between">
            <button className="p-2 text-white/80 hover:text-white transition-colors">
              <X size={28} />
            </button>
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Preview</span>
            <div className="w-10" />
          </header>
          <div className="flex-1 flex items-center justify-center p-6">
            <img 
              src={fullscreenImage} 
              alt="Fullscreen View" 
              className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 rounded-sm" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
