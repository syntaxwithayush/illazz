import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Clock,
  CheckCheck,
  Loader2,
  AlertCircle,
  Paperclip,
  Phone,
  Video,
  Sparkles
} from 'lucide-react';

export default function DoctorMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesHistory, setMessagesHistory] = useState({});
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getMessages();
      if (res.success) {
        const msgs = res.messages || [];
        setConversations(msgs);
        if (msgs.length > 0) {
          setSelectedConversation(msgs[0]);
          // Initialize mock thread messages
          const initialMap = {};
          msgs.forEach((m) => {
            initialMap[m.id] = [
              {
                id: 1,
                sender: 'patient',
                sender_name: m.patient_name,
                text: m.last_message,
                timestamp: m.timestamp
              }
            ];
          });
          setMessagesHistory(initialMap);
        }
      } else {
        setError('Failed to fetch messages.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    const newMsg = {
      id: Date.now(),
      sender: 'doctor',
      sender_name: user?.full_name || 'Dr. Ananya Sharma',
      text: replyText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessagesHistory((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg]
    }));

    setReplyText('');
  };

  const handleCannedReply = (template) => {
    setReplyText(template);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((c) =>
    (c.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThread = selectedConversation
    ? messagesHistory[selectedConversation.id] || []
    : [];

  return (
    <DoctorLayout>
      <div className="space-y-4">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Inquiries & Messages</h1>
          <p className="text-sm text-slate-500 mt-1">
            Direct secure communication and follow-up consultation queries with your patients.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Messaging Interface */}
        <div className="bg-white rounded-3xl border border-[#e8eef5] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[620px]">
          
          {/* Left Panel: Conversations list */}
          <div className="w-full md:w-80 border-r border-[#e8eef5] flex flex-col bg-slate-50/50">
            {/* Search */}
            <div className="p-4 border-b border-[#e8eef5] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1677ff]"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e8eef5]">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1677ff] mx-auto mb-2" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No message threads found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-[#1677ff]'
                          : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-indigo-100 text-[#1677ff] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.patient_name ? conv.patient_name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">
                            {conv.patient_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatTime(conv.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {conv.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.last_message}
                        </p>
                      </div>
                      {conv.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#1677ff] mt-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Pane */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#e8eef5] flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1677ff] font-bold flex items-center justify-center">
                      {selectedConversation.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {selectedConversation.patient_name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Consultation
                        &bull; {selectedConversation.subject}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                  {currentThread.map((msg) => {
                    const isDoctor = msg.sender === 'doctor';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1 px-1">
                          <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                          <span>&bull;</span>
                          <span>{formatTime(msg.timestamp)}</span>
                        </div>
                        <div
                          className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isDoctor
                              ? 'bg-[#1677ff] text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Canned Quick Templates */}
                <div className="px-4 py-2 bg-slate-50/80 border-t border-[#e8eef5] flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-[#1677ff]" /> Quick:
                  </span>
                  {[
                    'Take medicine after breakfast.',
                    'Please log your blood pressure.',
                    'Everything looks normal.',
                    'Let us schedule a video call.',
                  ].map((tmpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCannedReply(tmpl)}
                      className="text-[11px] font-medium bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-[#1677ff] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>

                {/* Reply Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-[#e8eef5] bg-white flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Type your medical advice or response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-2.5 bg-[#1677ff] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 mb-2 text-slate-300" />
                Select a patient conversation thread to start messaging.
              </div>
            )}
          </div>

        </div>

      </div>
    </DoctorLayout>
  );
}
