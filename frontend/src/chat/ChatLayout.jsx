import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { getCurrentUser } from "../api/auth.api";
import { fetchThreads } from "../api/chat.api";
import UserSearch from "../components/UserSearch";
import Settings from "../pages/Settings";

export default function ChatLayout() {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage on mount
    return localStorage.getItem("theme") || "dark";
  });
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [callType, setCallType] = useState(null);
  const callSocketRef = useRef(null); 
  const [callStatus, setCallStatus] = useState(null); 
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [callMode, setCallMode] = useState(null); // "audio" | "video"
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const [isBlocked, setIsBlocked] = useState(() => {
    return localStorage.getItem("blocked") === "true";
  });

  const [selectedThread, setSelectedThread] = useState(() => {
    const saved = localStorage.getItem("active_thread");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  

  const handleLogout = () => {
    // 🔐 Clear auth tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  
    // 🧠 Clear last opened chat
    localStorage.removeItem("active_thread");
  
    // 📞 Close call socket safely
    if (callSocketRef.current) {
      callSocketRef.current.close();
      callSocketRef.current = null;
    }
  
    // 🧹 Cleanup call & UI state (VERY IMPORTANT)
    peerRef.current?.close();
    peerRef.current = null;
  
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
  
    setCallStatus(null);
    setCallType(null);
    setCallMode(null);
    setSelectedThread(null);
    setMessages([]);
  
    // 🚪 Redirect
    window.location.href = "/login";
  };


  const handleCallSignal = async (msg) => {

    // 🔔 STEP-1: Incoming call
    if (msg.type === "call:initiate") {
      console.log("📞 Incoming call:", msg.data.callType);
      setCallType(msg.data.callType);
      setCallStatus("incoming");
      return;
    }
    
    if (msg.type === "call:reject") {
      alert("❌ Call rejected");
      setCallStatus(null);
      setCallType(null);
      setCallMode(null);
      return;
    }

    if (msg.type === "call:end") {
      alert("📴 Call ended");
      cleanupCall(); 
      return;
    }
  
    if (msg.type === "call:switch") {
      setCallMode(msg.mode);
      return;
    }

    // ✅ STEP-2: Receiver accepted → caller creates OFFER
    if (msg.type === "call:accept") {
      console.log("✅ Call accepted");
  
      const peer = createPeer();
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
  
      callSocketRef.current.send(JSON.stringify({
        type: "offer",
        data: offer,
      }));
  
      return;
    }
  
    // 🔁 STEP-3: Receiver gets OFFER → sends ANSWER
    if (msg.type === "offer") {
      const peer = peerRef.current || createPeer();
  
      await peer.setRemoteDescription(
        new RTCSessionDescription(msg.data)
      );
  
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
  
      callSocketRef.current.send(JSON.stringify({
        type: "answer",
        data: answer,
      }));
  
      return;
    }
  
    // 🔗 STEP-4: Caller receives ANSWER → connected
    if (msg.type === "answer") {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(msg.data)
      );
  
      setCallStatus("connected");
      console.log("🎉 Call connected");
      return;
    }
  
    // ❄️ ICE candidates
    if (msg.type === "ice") {
      await peerRef.current.addIceCandidate(
        new RTCIceCandidate(msg.data)
      );
    }
  };

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
    fetchThreads()
      .then((res) => {
        console.log("✅ Threads loaded:", res.data);
        setThreads(res.data);
      })
      .catch((err) => {
        console.error("❌ Thread fetch error:", err);
        if (err.response?.status === 401) {
          handleLogout();
        }
      });
  }, []);

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    localStorage.setItem("active_thread", JSON.stringify(thread));
    setUserSearchQuery(""); // Clear search when thread is selected
  };

  const handleFollowUpdate = () => {
    // Refresh threads after follow/unfollow
    fetchThreads()
      .then((res) => {
        setThreads(res.data);
      })
      .catch((err) => {
        console.error("Failed to refresh threads:", err);
      });
  };

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

  // Fetch current user on mount and when updated
  const refreshCurrentUser = () => {
    getCurrentUser()
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch current user:", err);
        // If auth fails, redirect to login
        if (err.response?.status === 401) {
          handleLogout();
        }
      });
  };

  useEffect(() => {
    refreshCurrentUser();
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  const startCall = async (type) => {
    if (!selectedThread) return;
  
    if (!callSocketRef.current || callSocketRef.current.readyState !== 1) {
      alert("Call socket not connected yet");
      return;
    }
  
    setCallType(type);
    setCallStatus("calling");
    setCallMode(type);
  
    console.log("📞 Starting", type, "call");
  
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
  
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  
    callSocketRef.current.send(JSON.stringify({
      type: "call:initiate",
      data: { callType: type },
    }));
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });
  
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        callSocketRef.current.send(JSON.stringify({
          type: "ice",
          data: e.candidate,
        }));
      }
    };
  
    peer.ontrack = (e) => {
      console.log("🎥 Remote stream received");
      const stream = e.streams[0];
    
      // audio
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    
      // video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setIsVideoReady(true);
      }
    };
  
    localStreamRef.current.getTracks().forEach(track =>
      peer.addTrack(track, localStreamRef.current)
    );
  
    peerRef.current = peer;
    return peer;
  };

  function toggleMute() {
    const audioTrack = localStreamRef.current
      ?.getAudioTracks()[0];
  
    if (!audioTrack) return;
  
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }

  function toggleVideo() {
    const videoTrack = localStreamRef.current
      ?.getVideoTracks()[0];
  
    if (!videoTrack) return;
  
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoOff(!videoTrack.enabled);
  }

  async function switchToVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
  
    const videoTrack = stream.getVideoTracks()[0];
  
    const sender = peerRef.current
      .getSenders()
      .find(s => s.track?.kind === "video");
  
    if (sender) {
      sender.replaceTrack(videoTrack);
    } else {
      peerRef.current.addTrack(videoTrack, stream);
    }
  
    // 🔥 ADD THIS
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  
    localStreamRef.current.addTrack(videoTrack);
  
    setCallMode("video");
  
    callSocketRef.current.send(JSON.stringify({
      type: "call:switch",
      mode: "video"
    }));
  }

  function switchToAudio() {
    const sender = peerRef.current
      .getSenders()
      .find(s => s.track?.kind === "video");
  
    if (sender && sender.track) {
      sender.track.stop();
      peerRef.current.removeTrack(sender);
    }
  
    setCallMode("audio");
  
    callSocketRef.current.send(JSON.stringify({
      type: "call:switch",
      mode: "audio"
    }));
  }


  function endCall() {
    if (callSocketRef.current?.readyState === 1) {
      callSocketRef.current.send(
        JSON.stringify({ type: "call:end" })
      );
      callSocketRef.current.close(); 
    }
  
    cleanupCall();
  }

  function cleanupCall() {
  peerRef.current?.close();
  peerRef.current = null;

  localStreamRef.current?.getTracks().forEach(t => t.stop());
  localStreamRef.current = null;

  setCallStatus(null);
  setCallType(null);
  setCallMode(null);
  setIsMuted(false);
  setIsVideoOff(false);
  setIsVideoReady(false);
}

  // Send message function
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedThread || sending) return;

    const tempMessage = {
      id: Date.now(),
      text: messageInput || "",
      sender: { username: currentUser?.username || "You", id: currentUser?.id },
      created_at: new Date().toISOString(),
      status: 'sending',
      attachment: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        preview: filePreview
      } : null
    };

    // Optimistic UI update
    setMessages(prev => [...prev, tempMessage]);
    const textToSend = messageInput;
    const fileToSend = selectedFile;
    setMessageInput("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsTyping(false);
    setSending(true);

    try {
      let response;
      
      if (fileToSend) {
        // Send with attachment
        const formData = new FormData();
        formData.append("file", fileToSend);
        formData.append("text", textToSend || "");
        
        response = await api.post(`/chat/threads/${selectedThread.id}/media/`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        // Send text only
        response = await api.post(`/chat/${selectedThread.id}/send/`, {
          text: textToSend
        });
      }
      
      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? response.data : msg)
      );
      
      console.log("✅ Message sent:", response.data);
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert(err.response?.data?.error || "Failed to send message. Please try again.");
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

  useEffect(() => {
  if (!selectedThread) return;

  const token = localStorage.getItem("access");
  if (!token) {
    console.error("❌ No JWT token");
    return;
  }

  console.log("📡 Connecting call socket for thread", selectedThread.id);

  const wsUrl = `ws://127.0.0.1:8000/ws/call/${selectedThread.id}/?token=${token}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("📞 Call WS connected");
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    handleCallSignal(msg);
  };

  ws.onclose = () => {
    console.log("📞 Call WS closed");
    cleanupCall();
  };

  ws.onerror = (e) => {
    console.error("❌ Call WS error", e);
  };

  callSocketRef.current = ws;

  return () => ws.close();
}, [selectedThread]);
  

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />

      {selectedUserProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative bg-[#0f172a] w-[420px] rounded-2xl p-6 shadow-2xl border border-slate-700">

            {/* Close */}
            <button
              onClick={() => setSelectedUserProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>

            {/* Avatar */}
            <div className="flex flex-col items-center mt-2">
              {selectedUserProfile.avatar ? (
                <img
                  src={
                    selectedUserProfile.avatar.startsWith("http")
                      ? selectedUserProfile.avatar
                      : `http://127.0.0.1:8000${selectedUserProfile.avatar}`
                  }
                  onClick={() => setShowAvatarPreview(true)}
                  className="w-28 h-28 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-4xl text-white font-bold">
                  {selectedUserProfile.username[0].toUpperCase()}
                </div>
              )}

              {/* Username */}
              <h2 className="mt-4 text-xl font-bold text-white">
                {selectedUserProfile.username}
              </h2>

              {/* Bio */}
              <p className="mt-1 text-sm text-slate-400 text-center max-w-xs">
                {selectedUserProfile.bio || "No bio available"}
              </p>

              {/* Stats */}
              <div className="flex gap-8 mt-5 text-center">
                <div>
                  <p className="text-white font-semibold">
                    {selectedUserProfile.posts_count || 0}
                  </p>
                  <p className="text-xs text-slate-400">Posts</p>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {selectedUserProfile.followers_count || 0}
                  </p>
                  <p className="text-xs text-slate-400">Followers</p>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {selectedUserProfile.following_count || 0}
                  </p>
                  <p className="text-xs text-slate-400">Following</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 w-full">

                {selectedUserProfile.is_following ? (
                  <button
                    onClick={() => handleUnfollow(selectedUserProfile)}
                    className="flex-1 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(selectedUserProfile)}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition"
                  >
                    Follow
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedUserProfile(null);
                    handleMessage(selectedUserProfile);
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
                >
                  Message
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {showAvatarPreview && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center">
          
          <button
            onClick={() => setShowAvatarPreview(false)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          <img
            src={
              selectedUserProfile.avatar.startsWith("http")
                ? selectedUserProfile.avatar
                : `http://127.0.0.1:8000${selectedUserProfile.avatar}`
            }
            className="max-w-[90%] max-h-[90%] object-contain rounded-xl"
          />
        </div>
      )}

      {callStatus === "calling" && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 9997,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff"
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>
            📞 Calling…
          </div>
          <div style={{ opacity: 0.7, marginBottom: 20 }}>
            Waiting for response
          </div>

          <button
            onClick={endCall}
            style={{
              background: "#ef4444",
              padding: "10px 18px",
              borderRadius: 12
            }}
          >
            ❌ Cancel
          </button>
        </div>
      )}

      {callStatus === "connected" &&
      callMode === "video" &&
      isVideoReady && (   // 🔥 NEW GUARD
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 9998
        }}>
          
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />

          {/* Local Preview */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 160,
              height: 220,
              objectFit: "cover",
              borderRadius: 12,
              border: "2px solid white"
            }}
          />
        </div>
      )}

      
      
      <div style={{
        display: 'flex',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: theme === 'dark' ? '#020617' : '#F0F2F5',
        color: theme === "dark" ? "#E5E7EB" : "#000"
      }}>
        {/* Settings Modal */}
        {showSettings && (
          <Settings
            onClose={() => setShowSettings(false)}
            theme={theme}
            setTheme={setTheme}
            onUserUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              // Also refresh to ensure we have latest data
              refreshCurrentUser();
            }}
          />
        )}

        {/* SIDEBAR */}
        <div style={{
          width: '360px',
          backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
          borderRight: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: theme === "dark" ? "1px solid #1E293B": "1px solid #E4E6EB",
            backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flex: 1,
              minWidth: 0, // Allow truncation
            }}>
              {currentUser && (
                <>
                  {/* Avatar */}
                  {(() => {
                    const avatarUrl = currentUser.avatar_url || 
                      (currentUser.avatar ? 
                        (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://127.0.0.1:8000${currentUser.avatar}`) 
                        : null);
                    
                    return avatarUrl ? (
                      <img
                        key={avatarUrl} // Force re-render when URL changes
                        src={avatarUrl}
                        alt={currentUser.username}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${theme === "dark" ? "#475569" : "#E2E8F0"}`,
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          // Hide image and show initials on error
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null;
                  })()}
                  {(!currentUser.avatar_url && !currentUser.avatar) && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(to bottom right, #9333EA, #EC4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {getInitials(currentUser.username)}
                    </div>
                  )}
                  {/* Username */}
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {currentUser.username}
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#22c55e",
                    }}>
                       <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            display: "inline-block",
                            boxShadow: "0 0 6px rgba(34,197,94,0.8)", // glow
                          }}
                        />    

                      Online
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              title="Settings"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === "dark" ? "#1E293B" : "#E4E6EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ⚙️
            </button>
          </div>

          {/* User Search */}
          <div style={{
            padding: '12px 16px',
            borderBottom: theme === "dark" ? "1px solid #1E293B": "1px solid #E4E6EB",
            backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
            position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: theme === "dark" ? "#1E293B" : "#F0F2F5",
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: theme === "dark" ? "#64748B" : "#9CA3AF",
              }}>🔍</span>
            </div>
            {userSearchQuery.trim().length >= 2 && (
              <UserSearch
                searchQuery={userSearchQuery}
                onThreadSelect={handleThreadSelect}
                currentUser={currentUser}
                onFollowUpdate={handleFollowUpdate}
                onUserClick={(user) => {
                  setSelectedUserProfile(user);
                  setSelectedThread(null);
                }}  
              />
            )}
          </div>

          {/* Thread List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {threads.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: theme === "dark" ? "#94A3B8" : "#65676B"
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>
                  No chats yet
                </div>
                <div style={{ fontSize: '13px', color: theme === "dark" ? "#64748B" : "#9CA3AF" }}>
                  Search for users above and follow them to start chatting
                </div>
              </div>
            ) : (
              threads.map((thread) => {
                // Get other user from thread members
                const otherUser = thread.members?.find(m => m.id !== currentUser?.id);
                const threadName = otherUser?.username || thread.name || "Direct Chat";
                
                return (
                <div
                  key={thread.id}
                  onClick={() => handleThreadSelect(thread)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: selectedThread?.id === thread.id ? theme === "dark" ? "#1E293B" : "#E4F2FF" : "transparent",
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
                    position: 'relative',
                    flexShrink: 0,
                  }}>
                    {otherUser?.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.username}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '16px',
                      }}>
                        {getInitials(otherUser?.username)}
                      </div>
                    )}

                    {otherUser?.is_online && (
                      <span style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid #020617',
                      }} />
                    )}
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
                        ? (theme === 'dark' ? '#E5E7EB' : '#0F172A')
                        : (theme === 'dark'
                            ? '#94A3B8'
                            : '#374151'),     
                        
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {threadName}
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
              );
              })
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF" }}>
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
                  {(() => {
                    const otherUser = selectedThread.members?.find(m => m.id !== currentUser?.id);
                    const threadName = otherUser?.username || selectedThread.name || "Direct Chat";
                    return getInitials(threadName);
                  })()}
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
                    {(() => {
                      const otherUser = selectedThread.members?.find(m => m.id !== currentUser?.id);
                      return otherUser?.username || selectedThread.name || "Direct Chat";
                    })()}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: "dark" ? "#94A3B8" : "#00A884",
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
                    onClick={() => {
                      if (isBlocked) return;
                      setShowCallOptions(prev => !prev);
                    }}
                    title={isBlocked ? "User is blocked" : "Call"}
                    disabled={isBlocked}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: showCallOptions ? '#E4E6EB' : 'transparent',
                      cursor: isBlocked ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.15s',
                      opacity: isBlocked ? 0.4 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isBlocked) e.currentTarget.style.backgroundColor = '#F0F2F5';
                    }}
                    onMouseLeave={(e) => {
                      if (!isBlocked) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
                        onClick={() => {
                          if (isBlocked) return;
                          startCall("audio");
                          setShowCallOptions(false);
                        }}
                        disabled={isBlocked}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "none",
                          background: "white",
                          cursor: isBlocked ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          textAlign: "left",
                          opacity: isBlocked ? 0.4 : 1
                        }}
                      >
                        🎧 Audio Call
                      </button>

                      <button
                        onClick={() => {
                          if (isBlocked) return;
                          startCall("video");
                          setShowCallOptions(false);
                        }}
                        disabled={isBlocked}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "none",
                          background: "white",
                          cursor: isBlocked ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          textAlign: "left",
                          opacity: isBlocked ? 0.4 : 1
                        }}
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
                          setShowSettings(true);
                          setShowMenu(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 14,
                          borderBottom: theme === "dark" ? "1px solid #1E293B" : "1px solid #ddd"
                        }}
                      >
                        ⚙️ Settings
                      </div>
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
                        label={isBlocked ? "🔓 Unblock User" : "🚫 Block User"}
                        onClick={() => {
                          const next = !isBlocked;          // ✅ FIX #1

                          setIsBlocked(next);               // state update
                          localStorage.setItem("blocked", String(next)); // ✅ FIX #2

                          setShowMenu(false);
                        }}
                      />


                      <MenuItem
                        label={isFollowing ? "❌ Unfollow" : "✅ Follow"}
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

            {callStatus === "incoming" && (
              <div style={{
                position: "absolute",
                top: 80,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#111827",
                color: "#fff",
                padding: "20px 24px",
                borderRadius: "16px",
                zIndex: 9999,
                display: "flex",
                gap: "16px",
                alignItems: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
              }}>
                <div style={{ fontSize: 16 }}>
                  📞 Incoming {callType} call
                </div>

                <button
                  onClick={async () => {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: true,
                      video: callType === "video",
                    });

                    localStreamRef.current = stream;
                    if (localVideoRef.current) {
                      localVideoRef.current.srcObject = stream;
                    }
                    setCallMode(callType);
                    setCallStatus("connecting");
                    callSocketRef.current.send(JSON.stringify({
                      type: "call:accept",
                    }));
                  }}
                  style={{
                    background: "#22c55e",
                    border: "none",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Accept
                </button>

                <button
                  onClick={() => {
                    callSocketRef.current.send(JSON.stringify({
                      type: "call:reject",
                  }));
                  setCallStatus(null);
                  setCallType(null);
                  setCallMode(null);    
                  }}
                  style={{
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Reject
                </button>
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
                    const isOwn = msg.sender?.username === currentUser?.username || msg.sender?.id === currentUser?.id;
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
                            position: 'relative',
                            maxWidth: '400px'
                          }}>
                            {/* Attachment */}
                            {msg.attachment && (
                              <div style={{ marginBottom: msg.text ? '8px' : '0' }}>
                                {msg.is_media && msg.file_type?.startsWith('image/') ? (
                                  <a
                                    href={msg.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'block' }}
                                  >
                                    <img
                                      src={msg.attachment}
                                      alt="Attachment"
                                      style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={msg.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: '12px',
                                      backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      textDecoration: 'none',
                                      color: 'inherit',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span style={{ fontSize: '20px' }}>📄</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}>
                                        {msg.file_name || 'File'}
                                      </div>
                                      {msg.file_size && (
                                        <div style={{
                                          fontSize: '11px',
                                          opacity: 0.8,
                                        }}>
                                          {(msg.file_size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                      )}
                                    </div>
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {/* Text */}
                            {msg.text && (
                              <div style={{
                                fontSize: '14px',
                                lineHeight: '1.5',
                                marginBottom: '2px'
                              }}>
                                {msg.text}
                              </div>
                            )}
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

              

              {/* File Preview */}
              {selectedFile && (
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #E4E6EB',
                  backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: theme === "dark" ? "#1E293B" : "#E4E6EB",
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}>
                      📄
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {selectedFile.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme === "dark" ? "#94A3B8" : "#64748B",
                    }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: theme === "dark" ? "#1E293B" : "#E4E6EB",
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
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
                  onClick={() => {
                    if (isBlocked) return;
                    fileInputRef.current.click();
                  }}
                  title={isBlocked ? "You blocked this user" : "Attach file"}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                    fontSize: '20px',
                    opacity: isBlocked ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📎
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Validate file size (10MB)
                    if (file.size > 10 * 1024 * 1024) {
                      alert("File size must be less than 10MB");
                      e.target.value = "";
                      return;
                    }

                    setSelectedFile(file);

                    // Create preview for images
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFilePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFilePreview(null);
                    }

                    e.target.value = "";
                  }}
                />

                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isBlocked
                      ? "You blocked this user"
                      : "Type a message..."
                  }
                  disabled={sending || isBlocked}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: '1px solid #E4E6EB',
                    borderRadius: '20px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: isBlocked ? '#E5E7EB' : '#F0F2F5',
                    cursor: isBlocked ? 'not-allowed' : 'text',
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
                    onClick={() => {
                      if (isBlocked) return;
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    title={isBlocked ? "You blocked this user" : "Add emoji"}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: isBlocked ? 'not-allowed' : 'pointer',
                      fontSize: '20px',
                      opacity: isBlocked ? 0.4 : 1,
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
                  disabled={(sending || isBlocked) || (!messageInput.trim() && !selectedFile)}
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
    </>
  );
}  