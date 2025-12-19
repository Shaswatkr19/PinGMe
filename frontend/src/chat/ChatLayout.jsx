import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function ChatLayout() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [theme, setTheme] = useState("light"); // light | dark
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [callType, setCallType] = useState(null); 
  // "audio" | "video" | null
  const [callStatus, setCallStatus] = useState(null); 
  // "calling" | "incoming" | "connected" | null

  
  const MenuItem = ({ label, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "none",
        background: "white",
        cursor: "pointer",
        fontSize: "14px",
        textAlign: "left"
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0F2F5"}
      onMouseLeave={e => e.currentTarget.style.background = "white"}
    >
      {label}
    </button>
  );

  const callOptionStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "none",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left"
  };

  const filteredMessages = searchText
  ? messages.filter(m =>
      m.text.toLowerCase().includes(searchText.toLowerCase())
    )
  : messages;

  const fileInputRef = useRef(null);


  // Fetch threads on mount
  useEffect(() => {
    api.get("/chat/")
      .then((res) => {
        console.log("✅ Threads loaded:", res.data);
        setThreads(res.data);
      })
      .catch((err) => {
        console.error("❌ Thread fetch error:", err);
      });
  }, []);

  // Fetch messages when thread is selected
  useEffect(() => {
    if (selectedThread) {
      console.log("🔍 Fetching messages for thread:", selectedThread.id);
      setLoading(true);
      
      api.get(`/chat/${selectedThread.id}/messages/`)
        .then((res) => {
          console.log("✅ Messages loaded:", res.data);
          setMessages(res.data);
        })
        .catch((err) => {
          console.error("❌ Message fetch error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedThread]);

  const handleThreadClick = (thread) => {
    console.log("🔍 Thread clicked:", thread);
    setSelectedThread(thread);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (hours < 24) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (hours < 48) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return "DC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusIcon = (status) => {
    if (status === 'sent') return '✓';
    if (status === 'delivered') return '✓✓';
    if (status === 'read') return '✓✓';
    return '';
  };

  // Get current user (adjust based on your auth setup)
  const currentUser = "shaswat"; // Replace with actual current user logic

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    setIsTyping(true);
  
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  
    setTypingTimeout(timeout);
  };

  const startCall = (type) => {
    setCallType(type);
    alert(type === "audio" ? "Audio call started" : "Video call started");          // audio / video
    setCallStatus("calling");
  
    // 🔔 later: websocket emit
    console.log("📞 Calling:", type);
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThread || sending) return;

    const tempMessage = {
      id: Date.now(),
      text: messageInput,
      sender: { username: currentUser },
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    // Optimistic UI update
    setMessages(prev => [...prev, tempMessage]);
    setMessageInput("");
    setIsTyping(false);
    setSending(true);

    try {
      const response = await api.post(`/chat/${selectedThread.id}/send/`, {
        text: messageInput
      });
      
      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? response.data : msg)
      );
      
      console.log("✅ Message sent:", response.data);
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Emoji picker (simple emojis)
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '😍'];

  const handleEmojiClick = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: theme === 'dark' ? '#0F172A' : '#F0F2F5',
      color: theme === "dark" ? "#E5E7EB" : "#000"
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: '360px',
        backgroundColor: theme === "dark" ? "#020617" : "#F8F9FA",
        borderRight: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: theme === "dark" ? "1px solid #1E293B": "1px solid #E4E6EB",
          backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 700,
            color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
          }}>Chats</h2>
        </div>

        {/* Thread List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#65676B'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div style={{ fontSize: '15px' }}>No chats yet</div>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleThreadClick(thread)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: selectedThread?.id === thread.id ? '#E4F2FF' : 'transparent',
                  borderLeft: selectedThread?.id === thread.id ? '4px solid #0084FF' : '4px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (selectedThread?.id !== thread.id) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedThread?.id !== thread.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#0084FF',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {getInitials(thread.name || "Direct Chat")}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: selectedThread?.id === thread.id ? 700 : 500,
                      color: selectedThread?.id === thread.id
                      ? '#0F172A' 
                      : (theme === 'dark'
                          ? '#94A3B8'
                          : '#374151'),     
                      
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {thread.name || "Direct Chat"}
                    </span>
                    {thread.updated_at && (
                      <span style={{
                        fontSize: '12px',
                        color: '#65676B',
                        marginLeft: '8px',
                        flexShrink: 0
                      }}>
                        {formatTime(thread.updated_at)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#65676B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1
                    }}>
                      {thread.last_message?.text || "No messages yet"}
                    </span>
                    {thread.unread_count > 0 && (
                      <div style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: '#0084FF',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px'
                      }}>
                        {thread.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF", 
              borderBottom: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0084FF',
                color:  theme === "dark" ? "#94A3B8" : "#00A884",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 600,
                position: 'relative'
              }}>
                {getInitials(selectedThread.name || "Direct Chat")}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#00A884',
                  border: '2px solid #FFFFFF',
                  position: 'absolute',
                  bottom: '0',
                  right: '0'
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                }}>
                  {selectedThread.name || "Direct Chat"}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#00A884', "#E5E7EB" : "#1C1E21",
                }}>
                  Active now
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowSearch(prev => !prev)}
                  title="Search"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: showSearch ? '#E4E6EB' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🔍
                </button>

                
              <div style={{ position: "relative" }}> 
                {/* Call Button */} 
                <button
                  onClick={() => setShowCallOptions(prev => !prev)}
                  title="Call"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: showCallOptions ? '#E4E6EB' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                 📞
                </button>

                {/* AUDIO / VIDEO OPTIONS */}
                {showCallOptions && (
                  <div style={{
                    position: "absolute",
                    top: "42px",
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    zIndex: 1000,
                    minWidth: "150px"
                  }}>
                    <button
                      onClick={() => startCall("audio")}
                      style={callOptionStyle}
                    >
                      🎧 Audio Call
                    </button>

                    <button
                      onClick={() => startCall("video")}
                      style={callOptionStyle}
                    >
                      🎥 Video Call
                    </button>
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}></div>
                <button
                  onClick={() => setShowMenu(prev => !prev)}
                  title="More"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: showMenu ? theme === "dark" ? "#1E293B" : "#E4E6EB" : "transparent", 
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: theme === "dark" ? "#FFFFFF" : "#000000", 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ⋮
                </button>

                {showMenu && (
                  <div style={{
                    position: "absolute",
                    top: "42px",
                    right: 0,
                    backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
                    color: theme === "dark" ? "#FFFFFF" : "#000",
                    border: theme === "dark" ? "1px solid #1E293B" : "1px solid #ddd",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: "180px",
                    zIndex: 1000,
                    overflow: "hidden"
                  }}>
                    <div
                      onClick={() => {
                        setTheme(prev => prev === "dark" ? "light" : "dark");
                        setShowMenu(false);
                      }}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontSize: 14
                      }}
                    >
                      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
                    </div>
                  
                    
                    <MenuItem
                      label={isBlocked ? "Unblock User" : "Block User"}
                      onClick={() => {
                        setIsBlocked(prev => !prev);
                        setShowMenu(false);
                      }}
                    />

                    <MenuItem
                      label={theme === "light" ? "Dark Theme" : "Light Theme"}
                      onClick={() => {
                        setTheme(prev => prev === "light" ? "dark" : "light");
                        setShowMenu(false);
                      }}
                    />

                    <MenuItem
                      label={isFollowing ? "Unfollow" : "Follow"}
                      onClick={() => {
                        setIsFollowing(prev => !prev);
                        setShowMenu(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          

            {showSearch && (
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #E4E6EB',
              backgroundColor: '#FFFFFF'
            }}>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  height: '44px',          // 🔥 height badhai
                  padding: '0 14px',       // 🔥 andar space
                  borderRadius: '10px',    // 🔥 smooth corners
                  border: '1px solid #DADDE1',
                  fontSize: '15px',        // 🔥 text thoda bada
                  outline: 'none',
                  backgroundColor: '#F0F2F5'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0084FF'}
                onBlur={(e) => e.target.style.borderColor = '#DADDE1'}
              />
            </div>
          )}

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: theme === "dark" ? "#020617" : "#F8F9FA",
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: '#65676B', padding: '40px' }}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#65676B'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>No messages yet</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>Start the conversation!</div>
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isOwn = msg.sender.username === currentUser;
                  const prevMsg = messages[idx - 1];
                  const showAvatar = !prevMsg || prevMsg.sender.username !== msg.sender.username;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginTop: showAvatar ? '12px' : '2px'
                      }}
                    >
                      <div style={{
                        maxWidth: '65%',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-end'
                      }}>
                        {!isOwn && (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#E4E6EB',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            visibility: showAvatar ? 'visible' : 'hidden',
                            flexShrink: 0,
                            fontWeight: 600,
                            color: '#65676B'
                          }}>
                            {getInitials(msg.sender.username)}
                          </div>
                        )}

                        <div style={{
                          padding: '8px 12px',
                          borderRadius: '16px',
                          backgroundColor: isOwn ? "#2563EB" : theme === "dark" ? "#1E293B" : "#E4E6EB",
                          color: isOwn ? '#FFFFFF' : theme === "dark" ? "#FFFFFF" : "#000000",
                          wordWrap: 'break-word',
                          position: 'relative'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            lineHeight: '1.5',
                            marginBottom: '2px'
                          }}>
                            {msg.text}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: isOwn ? 'rgba(255,255,255,0.8)' : '#65676B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'flex-end'
                          }}>
                            {formatTime(msg.created_at)}
                            {isOwn && msg.status && (
                              <span style={{
                                color: msg.status === 'read' ? '#4FC3F7' : 'rgba(255,255,255,0.8)'
                              }}>
                                {getStatusIcon(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {isTyping && (
              <div style={{
                padding: '6px 20px',
                fontSize: '13px',
                color: '#65676B',
                fontStyle: 'italic'
              }}>
                typing...
              </div>
            )}

            

            {/* Input Area */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #E4E6EB',
              backgroundColor: theme === "dark" ? "#020617" : "#F8F9FA",
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              position: 'relative'
            }}>
              <button 
                onClick={() => fileInputRef.current.click()}
                title="Attach file"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📎
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    console.log("📎 Selected file:", file);
                    alert(`Selected file: ${file.name}`);

                    // future: yahin se API call hogi
                  }}
                />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #E4E6EB',
                  borderRadius: '20px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#F0F2F5',
                  transition: 'all 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.borderColor = '#0084FF';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = '#F0F2F5';
                  e.target.style.borderColor = '#E4E6EB';
                }}
              />

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add emoji"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  😊
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute',
                    bottom: '50px',
                    right: '0',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E6EB',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    zIndex: 1000
                  }}>
                    {commonEmojis.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => handleEmojiClick(emoji)}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '24px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {messageInput.trim() && (
                <button 
                  onClick={handleSendMessage}
                  disabled={sending}
                  title="Send message"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: sending ? '#CED0D4' : '#0084FF',
                    color: '#FFFFFF',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) e.currentTarget.style.backgroundColor = '#0077E6';
                  }}
                  onMouseLeave={(e) => {
                    if (!sending) e.currentTarget.style.backgroundColor = '#0084FF';
                  }}
                >
                  {sending ? '...' : '➤'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#65676B'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <div style={{ fontSize: '18px', fontWeight: 500 }}>Select a chat to start messaging</div>
          </div>
        )}
      </div>
    </div>
  );
}