import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { getCurrentUser } from "../api/auth.api";
import { fetchThreads } from "../api/chat.api";
import UserSearch from "../components/UserSearch";
import Settings from "../pages/Settings";
import { blockUser, unblockUser } from "../api/auth.api";

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
  const [showSettings, setShowSettings] = useState(false);
  
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
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [chatTheme, setChatTheme] = useState(null); 

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
 
  const touchMovedRef = useRef(false);        
  const longPressTimerRef = useRef(null); 
      
  const [messageReactions, setMessageReactions] = useState({});
  

  const [followState, setFollowState] = useState({
    isFollowing: false,
    isBlocked: false
  });

  const { isBlocked, isFollowing } = followState;

  const [selectedThread, setSelectedThread] = useState(() => {
    const saved = localStorage.getItem("active_thread");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const touchStartXRef = useRef(0);
  const touchCurrentXRef = useRef(0);
    

  const [showReactions, setShowReactions] = useState(null);

  useEffect(() => {
    const closeReactions = () => setShowReactions(null);
    
    if (showReactions) {
      document.addEventListener('click', closeReactions);
      return () => document.removeEventListener('click', closeReactions);
    }
  }, [showReactions]);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved && saved !== "auto") return saved;
    
    // Auto detect
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
  });

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("theme") || "auto";
  });

  const chatThemes = [
    {
      label: "🌌 Midnight Glow",
      type: "pattern",
      value: {
        background: "#020617",
        backgroundSize: "cover",
        animation: "none",
        pattern: `
  radial-gradient(circle at 20% 30%, rgba(59,130,246,0.12), transparent 40%),
  radial-gradient(circle at 80% 20%, rgba(168,85,247,0.12), transparent 45%),
  radial-gradient(circle at 50% 80%, rgba(34,197,94,0.10), transparent 45%)
  `
      }
    },
    {
      label: "🌊 Ocean Night",
      type: "pattern",
      value: {
        background: "#020617",
        backgroundSize: "cover",
        animation: "none",
        pattern: `
  radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 45%),
  radial-gradient(circle at bottom right, rgba(6,182,212,0.15), transparent 45%)
  `
      }
    },
    {
      label: "💜 Purple Luxe",
      type: "pattern",
      value: {
        background: "#020617",
        backgroundSize: "cover",
        animation: "none",
        pattern: `
  radial-gradient(circle at 30% 20%, rgba(168,85,247,0.22), transparent 40%),
  radial-gradient(circle at 70% 80%, rgba(236,72,153,0.18), transparent 45%)
  `
      }
    },
    {
      label: "💬 WhatsApp Classic",
      type: "pattern",
      value: {
        background: "#0b141a",   // WhatsApp dark base
        animation: "none",
        pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E
  %3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='2'%3E
  %3Cpath d='M20 30 h40 v30 h-40 z'/%3E
  %3Cpath d='M90 20 q20 0 20 20 q0 20 -20 20 q-10 10 -15 15 v-15 q-15 0 -15 -20 q0 -20 30 -20z'/%3E
  %3Cpath d='M120 120 h35 v25 h-35 z'/%3E
  %3Cpath d='M30 110 q15 -15 30 0'/%3E
  %3C/g%3E
  %3C/svg%3E")`
      }
    },
    {
        label: "☀️ Sunny Delight",
        type: "pattern",
        value: {
          background: "#fef3c7",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 20% 30%, rgba(251,191,36,0.2), transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(249,115,22,0.15), transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(245,158,11,0.18), transparent 45%)
    `
        }
    },
    {
        label: "🌸 Blossom Fresh",
        type: "pattern",
        value: {
          background: "#fce7f3",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at top left, rgba(236,72,153,0.2), transparent 45%),
    radial-gradient(circle at bottom right, rgba(244,114,182,0.18), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(251,207,232,0.3), transparent 40%)
    `
        }
    },
    {
        label: "🍃 Mint Garden",
        type: "pattern",
        value: {
          background: "#d1fae5",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 30% 20%, rgba(16,185,129,0.25), transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(52,211,153,0.2), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(110,231,183,0.15), transparent 50%)
    `
        }
    },
    {
        label: "🌈 Rainbow Joy",
        type: "pattern",
        value: {
          background: "#fef9c3",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 15% 25%, rgba(239,68,68,0.12), transparent 35%),
    radial-gradient(circle at 85% 30%, rgba(59,130,246,0.12), transparent 35%),
    radial-gradient(circle at 50% 75%, rgba(34,197,94,0.15), transparent 40%),
    radial-gradient(circle at 40% 60%, rgba(168,85,247,0.1), transparent 35%)
    `
        }
    },
    {
        label: "🏖️ Beach Vibes",
        type: "pattern",
        value: {
          background: "#e0f2fe",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 45%),
    radial-gradient(circle at bottom right, rgba(56,189,248,0.18), transparent 45%),
    radial-gradient(circle at 50% 30%, rgba(125,211,252,0.2), transparent 40%)
    `
        }
    },
    {
        label: "🍑 Peach Cream",
        type: "pattern",
        value: {
          background: "#ffedd5",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 25% 35%, rgba(251,146,60,0.18), transparent 40%),
    radial-gradient(circle at 75% 65%, rgba(253,186,116,0.2), transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(254,215,170,0.25), transparent 50%)
    `
        }
    },
    {
        label: "💜 Lavender Dream",
        type: "pattern",
        value: {
          background: "#ede9fe",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 30% 20%, rgba(139,92,246,0.2), transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(167,139,250,0.18), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(196,181,253,0.22), transparent 45%)
    `
        }
    },
    {
        label: "🌺 Tropical Paradise",
        type: "pattern",
        value: {
          background: "#fef3c7",
          backgroundSize: "cover",
          animation: "none",
          pattern: `
    radial-gradient(circle at 20% 40%, rgba(236,72,153,0.15), transparent 38%),
    radial-gradient(circle at 80% 30%, rgba(245,158,11,0.18), transparent 40%),
    radial-gradient(circle at 45% 75%, rgba(20,184,166,0.2), transparent 42%)
    `
        }
    }
    
  ];  

  
const [isMobile, setIsMobile] = useState(false);
const [showSidebar, setShowSidebar] = useState(true);

useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    // Mobile pe sidebar auto-hide when chat selected
    if (mobile && selectedThread) {
      setShowSidebar(false);
    }
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, [selectedThread]);


  const refreshThreads = async () => {
    try {
      const res = await fetchThreads();
      setThreads(res.data);

      if (selectedThread) {
        const updatedThread = res.data.find(
          t => t.id === selectedThread.id
        );

        if (updatedThread) {
          setSelectedThread(updatedThread);
          localStorage.setItem(
            "active_thread",
            JSON.stringify(updatedThread)
          );

          // ✅ SINGLE SOURCE OF TRUTH
          const otherUser = updatedThread.members.find(
            m => m.id !== currentUser?.id
          );
        }
      }
    } catch (err) {
      console.error("❌ Failed to refresh threads:", err);
    }
  };
      

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}/`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch {
      alert("Failed to delete message");
    }
  };


  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Delete entire chat?")) return;
  
    try {
      await api.delete(`/chat/thread/${threadId}/`);
  
      setThreads(prev => prev.filter(t => t.id !== threadId));
      setSelectedThread(null);
      setMessages([]);
      localStorage.removeItem("active_thread");
    } catch {
      alert("Failed to delete chat");
    }
  };

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

      if (callType === "video") {
        setIsVideoReady(true);
      }
  
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

      if (callMode === "video") {
        setTimeout(() => {
          setIsVideoReady(true);
        }, 500);  
      }
  
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

    // 📞 CALL SOCKET — THREAD SELECT PE AUTO CONNECT
    useEffect(() => {
      if (!selectedThread?.id) return;
    
      // already connected
      if (callSocketRef.current) return;
    
      const token = localStorage.getItem("access");
      if (!token) return;
    
      const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/call/${selectedThread.id}/?token=${token}`
      );
    
      callSocketRef.current = ws;
    
      ws.onopen = () => {
        console.log("📞 Call WS connected");
      };
    
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleCallSignal(data);
      };
    
      ws.onerror = (e) => {
        console.error("❌ Call WS error", e);
      };
    
      ws.onclose = () => {
        console.log("📴 Call WS closed");
        callSocketRef.current = null;
      };
    
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        callSocketRef.current = null;
      };
    }, [selectedThread?.id]);

  const MenuItem = ({ label, onClick, theme }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        textAlign: "left",
  
        backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
        color: theme === "dark" ? "#E5E7EB" : "#000",
  
        borderTop: theme === "dark" ? "1px solid #1E293B" : "1px solid #E5E7EB"
      }}
      onMouseEnter={(e) =>
        e.currentTarget.style.backgroundColor =
          theme === "dark" ? "#1E293B" : "#F0F2F5"
      }
      onMouseLeave={(e) =>
        e.currentTarget.style.backgroundColor =
          theme === "dark" ? "#020617" : "#FFFFFF"
      }
    >
      {label}
    </button>
  );


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

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);
    localStorage.setItem("active_thread", JSON.stringify(thread));
    setUserSearchQuery("");
  
    if (isMobile) {
      setShowSidebar(false);
    }
  
    // Set chat theme
    if (thread.chat_theme) {
      setChatTheme(thread.chat_theme);
    } else {
      setChatTheme(null);
    }
  
    // Mark thread as read
    try {
      await api.post(`/chat/thread/${thread.id}/read/`);
  
      setThreads(prev =>
        prev.map(t =>
          t.id === thread.id
            ? { ...t, unread_count: 0 }
            : t
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark thread as read", err);
    }
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

  // 🌓 AUTO THEME DETECTION
  useEffect(() => {
    if (themeMode !== "auto") return;
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    darkModeQuery.addEventListener('change', updateTheme);
    
    return () => darkModeQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

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
  
    if (
      !callSocketRef.current ||
      callSocketRef.current.readyState !== WebSocket.OPEN
    ) {
      alert("Call socket not ready");
      return;
    }
    
    // small wait for WS
    setTimeout(async () => {
      if (callSocketRef.current.readyState !== 1) {
        alert("Call connection failed");
        return;
      }
  
      setCallType(type);
      setCallStatus("calling");
      setCallMode(type);
  
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
  
      localStreamRef.current = stream;
  
      callSocketRef.current.send(JSON.stringify({
        type: "call:initiate",
        data: { callType: type },
      }));
  
      console.log("📞 Call initiated");
    }, 200);
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
      if (remoteVideoRef.current && callMode === "video") {
        remoteVideoRef.current.srcObject = stream;
        
        // Wait for video to load
        remoteVideoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
        };
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


  const syncFollowState = (userId, isFollowing, isBlocked = false) => {
    console.log("🔄 Syncing follow state:", { userId, isFollowing, isBlocked });  // ✅ ADDED

    // Update profile modal
    setSelectedUserProfile(prev =>
      prev && prev.id === userId
        ? { ...prev, is_following: isFollowing, is_blocked: isBlocked }
        : prev
    );

    // Update threads
    setThreads(prev =>
      prev.map(thread => ({
        ...thread,
        members: thread.members.map(m =>
          m.id === userId
            ? { ...m, is_following: isFollowing, is_blocked: isBlocked }
            : m
        )
      }))
    );

    // Update selected thread
    setSelectedThread(prev =>
      prev
        ? {
            ...prev,
            members: prev.members.map(m =>
              m.id === userId
                ? { ...m, is_following: isFollowing, is_blocked: isBlocked }
                : m
            )
          }
        : prev
    );

    // Update local follow state
    setFollowState({
      isFollowing,
      isBlocked
    });
  };

  useEffect(() => {
    console.log("🧠 followState:", followState);
    console.log("Current:", currentUser?.username);
    console.log("Target:", activeOtherUser?.username);
  }, [followState]);

  // Send message function
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedThread || sending) return;

    const tempMessage = {
      id: Date.now(),
      text: messageInput || "",
      sender: { username: currentUser?.username || "You", id: currentUser?.id },
      created_at: new Date().toISOString(),
      status: 'sending',
      reply_to: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender: replyingTo.sender.username
      } : null,
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
    setReplyingTo(null); 
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

  // 🔥 COMPLETE REPLACEMENT - startRecording function (line ~945)

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 🔥 Try different mimeTypes - browser compatibility
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }
    
    console.log("🎤 Using MIME type:", mimeType);
    
    const recorder = new MediaRecorder(stream, { mimeType });
    
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        console.log("📦 Chunk received:", e.data.size, "bytes");
        audioChunksRef.current.push(e.data);
      }
    };
    
    recorder.onstop = async () => {
      console.log("🛑 Recording stopped");
      console.log("📦 Total chunks:", audioChunksRef.current.length);
      
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      
      console.log("🎵 Final blob size:", audioBlob.size);
      
      if (audioBlob.size === 0) {
        alert("Recording failed. Please try again.");
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        return;
      }

      // 🔥 BACKEND MIGHT EXPECT SPECIFIC FILENAME/EXTENSION
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `voice_${Date.now()}.${extension}`;
      
      const formData = new FormData();
      formData.append("file", audioBlob, filename);
      
      // 🔥 CRITICAL: Backend might need this field
      formData.append("text", "🎤 Voice message");
      
      // Debug FormData
      console.log("📤 Sending FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      try {
        setSending(true);
        
        const response = await api.post(
          `/chat/threads/${selectedThread.id}/media/`,
          formData,
          { 
            headers: { 
              "Content-Type": "multipart/form-data" 
            },
            timeout: 30000 // 30 second timeout
          }
        );
        
        console.log("✅ Voice sent:", response.data);
        setMessages(prev => [...prev, response.data]);
        
        const threadsRes = await fetchThreads();
        setThreads(threadsRes.data);
        
      } catch (err) {
        console.error("❌ Voice send failed:", err);
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
        console.error("Request config:", err.config);
        
        // Show detailed error
        const errorMsg = err.response?.data?.error 
          || err.response?.data?.detail
          || err.response?.data?.message
          || JSON.stringify(err.response?.data)
          || "Failed to send voice message";
        
        alert(`Failed to send voice: ${errorMsg}`);
      } finally {
        setSending(false);
      }
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      setRecordingTime(0);
      audioChunksRef.current = [];
    };
    
    // 🔥 Start with timeslice for consistent chunks
    recorder.start(1000); // 1 second chunks
    setIsRecording(true);
    
    console.log("🎤 Recording started");
    
    // Timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
  } catch (err) {
    console.error("❌ Mic access error:", err);
    alert("Microphone access denied. Please allow microphone in browser settings.");
  }
};

  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      audioChunksRef.current = [];
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  const reactionEmojis = ['❤️', '😂', '😮', '😢', '🙏', '👍'];
  // Emoji picker (simple emojis)
  const commonEmojis = [
    // 😀 Smiley
    '😀','😃','😄','😁','😆','😂','🤣','😊','😍','😘','😎','🤩','🥹','😭','😤','😡',
  
    // ❤️ Emotions
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞','💖',
  
    // 👍 Gestures
    '👍','👎','👌','🤌','👏','🙌','🤝','🙏','✌️','🤞','💪',
  
    // 🔥 Reactions
    '🔥','💯','🎉','✨','⚡','💥','🌈','☀️','🌙',
  
    // 😂 Fun
    '🤣','😜','🤪','😝','🙃','😏',
  
    // 😍 Love / Cute
    '🥰','😍','😘','😚','😻','💋',
  
    // 🎯 Misc
    '🎯','🚀','👀','🫶','🫡','🤍'
  ];

  const chatSocketRef = useRef(null);

  useEffect(() => {
    if (!selectedThread?.id) return;
  
    // 🚫 already connected (React strict-mode safe)
    if (chatSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
  
    const token = localStorage.getItem("access");
    if (!token) return;
  
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${selectedThread.id}/?token=${token}`
    );
  
    chatSocketRef.current = ws;
  
    ws.onopen = () => {
      console.log("💬 Chat WS connected");
    };
  
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "message_status") {
        setMessages(prev =>
          prev.map(m =>
            m.id === data.message_id
              ? { ...m, status: data.status }
              : m
          )
        );
      }  
  
      if (data.type === "presence") {
        const { user_id, is_online } = data;
  
        setThreads(prev =>
          prev.map(thread =>
            thread.id !== selectedThread.id
              ? thread
              : {
                  ...thread,
                  members: thread.members.map(m =>
                    m.id === user_id ? { ...m, is_online } : m
                  )
                }
          )
        );
  
        setSelectedThread(prev =>
          prev
            ? {
                ...prev,
                members: prev.members.map(m =>
                  m.id === user_id ? { ...m, is_online } : m
                )
              }
            : prev
        );
      }
  
      if (!currentUser) return;
  
      if (data.type === "message") {
        if (data.sender?.id === currentUser.id) return;
  
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    };
  
    ws.onerror = (e) => {
      console.error("❌ Chat WS error", e);
    };
  
    ws.onclose = (e) => {
      if (e.code !== 1000) {
        console.warn("WS closed unexpectedly", e);
      }
    };
  
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "cleanup");
      }
      chatSocketRef.current = null;
    };
  }, [selectedThread?.id, currentUser?.id]);


  
  const activeOtherUser = selectedThread?.members?.find(
    m => m.id !== currentUser?.id
  );

  const themeData = selectedThread?.chat_theme;

  const applyChatTheme = async (theme) => {
    await api.post(
      `/chat/threads/${selectedThread.id}/theme/`,
      {
        chat_theme: theme, 
      }
    );
  
    setSelectedThread((prev) => ({
      ...prev,
      chat_theme: theme,
    }));

    if (chatSocketRef.current?.readyState === WebSocket.OPEN) {
      chatSocketRef.current.send(JSON.stringify({
        type: 'theme_change',
        theme: theme
      }));
    }
    
    // In WebSocket onmessage, ADD:
    if (data.type === "theme_change") {
      setChatTheme(data.theme);
      setSelectedThread(prev => prev ? {
        ...prev,
        chat_theme: data.theme
      } : prev);
    }
  };

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
              {selectedUserProfile?.avatar || selectedUserProfile?.avatar_url ? (
                <img
                src={
                  (selectedUserProfile.avatar || selectedUserProfile.avatar_url).startsWith("http")
                    ? (selectedUserProfile.avatar || selectedUserProfile.avatar_url)
                    : `http://127.0.0.1:8000${selectedUserProfile.avatar}`
                }
                onClick={() => {
                  const url =
                    selectedUserProfile.avatar?.startsWith("http")
                      ? selectedUserProfile.avatar
                      : `http://127.0.0.1:8000${selectedUserProfile.avatar}`;
                
                  setAvatarPreviewUrl(url);
                  setShowAvatarPreview(true);
                }}
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
              

              {/* Stats / Actions */}
              <div className="mt-6 w-full">

              {/* Audio / Video */}
              <div className="flex justify-center gap-4 mb-5">
                <button
                  onClick={() => {
                    setSelectedUserProfile(null);
                    startCall("audio");
                  }}
                  className="flex items-center gap-2 px-6 py-2 rounded-full
                            bg-emerald-600 hover:bg-emerald-700
                            text-white font-semibold shadow-md transition"
                >
                  📞 Audio
                </button>

                <button
                  onClick={() => {
                    setSelectedUserProfile(null);
                    startCall("video");
                  }}
                  className="flex items-center gap-2 px-6 py-2 rounded-full
                            bg-indigo-600 hover:bg-indigo-700
                            text-white font-semibold shadow-md transition"
                >
                  🎥 Video
                </button>
              </div>

              {/* Followers / Following */}
              <div className="flex justify-center gap-10 text-center">
                <div className="cursor-pointer hover:opacity-80 transition">
                  <p className="text-white text-lg font-bold">
                    {selectedUserProfile.followers_count || 0}
                  </p>
                  <p className="text-xs text-slate-400">Followers</p>
                </div>

                <div className="cursor-pointer hover:opacity-80 transition">
                  <p className="text-white text-lg font-bold">
                    {selectedUserProfile.following_count || 0}
                  </p>
                  <p className="text-xs text-slate-400">Following</p>
                </div>
              </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 w-full">

                {selectedUserProfile?.id !== currentUser?.id && (
                <>
                  {selectedUserProfile.is_following ? (
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/auth/unfollow/${selectedUserProfile.username}/`);
                          syncFollowState(selectedUserProfile.id, false, false);
                          const res = await api.get(`/auth/search/?q=${selectedUserProfile.username}`);
                          setSelectedUserProfile(res.data[0]);
                        } catch (err) {
                          console.error("Unfollow failed", err);
                        }
                      }}
                      className="flex-1 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/auth/follow/${selectedUserProfile.username}/`);
                          syncFollowState(selectedUserProfile.id, true, false);
                          const res = await api.get(`/auth/search/?q=${selectedUserProfile.username}`);
                          setSelectedUserProfile(res.data[0]);
                        } catch (err) {
                          console.error("Follow failed", err);
                        }
                      }}
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
                </>
              )}  
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvatarPreview && avatarPreviewUrl && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center">
          
          <button
            onClick={() => setShowAvatarPreview(false)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          <img
            src={avatarPreviewUrl}
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

       {/* 🎧 AUDIO CALL UI */}
       {callStatus === "connected" && callMode === "audio" && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff"
        }}>
          {/* Caller Info */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48
            }}>
              {activeOtherUser?.avatar_url ? (
                <img
                  src={activeOtherUser.avatar_url}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <span>{activeOtherUser?.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>
              {activeOtherUser?.username}
            </h2>
            <p style={{ fontSize: 16, opacity: 0.9 }}>Audio Call</p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 20 }}>
            <button
              onClick={toggleMute}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: isMuted ? "#ef4444" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 24
              }}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>

            <button
              onClick={switchToVideo}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 24
              }}
            >
              🎥
            </button>

            <button
              onClick={endCall}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                cursor: "pointer",
                fontSize: 24
              }}
            >
              📞
            </button>
          </div>
        </div>
      )}


        {callStatus === "connected" && callMode === "video" && (
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
              bottom: 100,
              right: 20,
              width: 160,
              height: 220,
              objectFit: "cover",
              borderRadius: 12,
              border: "2px solid white"
            }}
          />

          {/* 🎮 VIDEO CONTROLS - BOTTOM CENTER */}
          <div style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 20,
            alignItems: "center"
          }}>
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: isMuted ? "#ef4444" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 24,
                backdropFilter: "blur(10px)"
              }}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>

            {/* Video Toggle Button */}
            <button
              onClick={toggleVideo}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: isVideoOff ? "#ef4444" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 24,
                backdropFilter: "blur(10px)"
              }}
            >
              {isVideoOff ? "📷" : "🎥"}
            </button>

            {/* Switch to Audio */}
            <button
              onClick={switchToAudio}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 24,
                backdropFilter: "blur(10px)"
              }}
            >
              🎧
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                cursor: "pointer",
                fontSize: 24
              }}
            >
              📞
            </button>
          </div>
        </div>
      )}

      
      
      <div style={{
        display: 'flex',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: theme === 'dark' ? '#020617' : '#F0F2F5',
        color: theme === "dark" ? "#E5E7EB" : "#000",
        position: 'relative',
        overflow: 'hidden'
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
          width: isMobile ? '100%' : '360px',
          backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
          borderRight: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
          display: isMobile ? (showSidebar ? 'flex' : 'none') : 'flex',
          flexDirection: 'column',
          position: isMobile ? 'absolute' : 'relative',
          zIndex: isMobile ? 100 : 'auto',
          height: '100vh'
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
            <div
              onClick={() => {
                setSelectedUserProfile(currentUser); // 🔥 OWN PROFILE MODAL
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flex: 1,
                minWidth: 0,
                cursor: 'pointer'
              }}
            >
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
                        onClick={(e) => {
                          e.stopPropagation();        // ❗ profile modal na khule
                          setAvatarPreviewUrl(avatarUrl);
                          setShowAvatarPreview(true);
                        }}
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
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarPreviewUrl(null); 
                        setShowAvatarPreview(true);
                      }}
                      style={{
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
                const otherUser = thread.members?.find(
                  m => m.id !== currentUser?.id
                );
                const threadName =
                otherUser?.username ||
                selectedThread?.name ||
                "Direct Chat";
                
                
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
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!otherUser?.avatar_url) return;

                      const url = otherUser.avatar_url.startsWith("http")
                        ? otherUser.avatar_url
                        : `http://127.0.0.1:8000${otherUser.avatar_url}`;

                      setAvatarPreviewUrl(url);
                      setShowAvatarPreview(true);
                    }}  
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      cursor: 'pointer',
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

                      {otherUser?.is_following && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: 'rgba(34,197,94,0.15)', // soft green bg
                            color: '#22c55e',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            boxShadow: '0 0 0 1px rgba(34,197,94,0.35)',
                          }}
                        >
                          <span style={{ fontSize: '12px' }}>✅</span>
                          Following
                        </span>
                      )}

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
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
                  borderBottom: theme === "dark"
                    ? "1px solid #1E293B"
                    : "1px solid #E4E6EB",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* 🔙 MOBILE BACK BUTTON */}
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 20,
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21"
                    }}
                  >
                    ←
                  </button>
                )}

                {/* LEFT: avatar + name + status (FULL CLICKABLE) */}
                {(() => {
                  const otherUser = selectedThread?.members?.find(
                    (m) => m.id !== currentUser?.id
                  );
                  if (!otherUser) return null;

                  return (
                    <div
                    onClick={() => {
                      setSelectedUserProfile(otherUser);
                    }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 40, height: 40, position: "relative" }}>
                        {otherUser.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt={otherUser.username}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg,#6366f1,#ec4899)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                            }}
                          >
                            {otherUser.username[0].toUpperCase()}
                          </div>
                        )}

                        {otherUser.is_online && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              background: "#22c55e",
                              borderRadius: "50%",
                              border: "2px solid #020617",
                            }}
                          />
                        )}
                      </div>

                      {/* Name + status */}
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color:
                              theme === "dark" ? "#E5E7EB" : "#1C1E21",
                          }}
                        >
                          {otherUser.username}
                        </div>
                        <div style={{ fontSize: '13px', color: otherUser?.is_online ? "#22c55e" : "#94A3B8", }}>
                          {otherUser.is_online ? "Active now" : "Offline"}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const otherUser = selectedThread?.members?.find(
                    m => m.id !== currentUser?.id
                  );

                  if (!otherUser?.is_following) return null;

                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        boxShadow: '0 0 0 1px rgba(34,197,94,0.35)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✅ Following
                    </span>
                  );
                })()}

                {/* Theme Picker Button */}
                <div style={{ position: "relative" }}>
                  <button
                    title="Chat Theme"
                    onClick={() => setShowThemePicker(prev => !prev)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "none",
                      background: showThemePicker 
                        ? (theme === "dark" ? "#1E293B" : "#E4E6EB")
                        : "transparent",
                      cursor: "pointer",
                      fontSize: 18,
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 
                        theme === "dark" ? "#1E293B" : "#F0F2F5";
                    }}
                    onMouseLeave={(e) => {
                      if (!showThemePicker) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    🎨
                  </button>

                  {showThemePicker && (
                    <div
                      style={{
                        position: "absolute",
                        top: 42,
                        right: 0,

                        background: theme === "dark" ? "#020617" : "#fff",
                        border: "1px solid #1E293B",
                        borderRadius: 12,

                        padding: 10,
                        zIndex: 2000,

                        width: "240px",        // ✅ FIXED WIDTH
                        maxHeight: "300px",    // ✅ HEIGHT LIMIT
                        overflowY: "auto",     // ✅ SCROLL

                        display: "grid",       // ✅ GRID
                        gridTemplateColumns: "1fr 1fr", // ✅ 2 COLUMNS
                        gap: "6px"
                      }}
                    >
                      {chatThemes.map((t) => (
                        <button
                          key={t.label}
                          onClick={() => {
                            applyChatTheme(t);
                            setShowThemePicker(false);
                          }}
                          style={{
                            padding: "6px 8px",
                            fontSize: "13px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",

                            background: theme === "dark" ? "#1E293B" : "#F1F5F9",
                            color: theme === "dark" ? "#E5E7EB" : "#0F172A",

                            textAlign: "left",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
  
                    </div>
                  )}
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
                      if (followState.isBlocked || !followState.isFollowing) return;
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
                      backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
                      border: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                      overflow: "hidden",
                      zIndex: 1000,
                      minWidth: "160px"
                    }}>
                      <button
                        onClick={() => {
                          if (followState.isBlocked || !followState.isFollowing) return;
                          startCall("audio");
                          setShowCallOptions(false);
                        }}
                        disabled={isBlocked}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "none",
                          background: theme === "dark" ? "#020617" : "#FFFFFF",
                          color: theme === "dark" ? "#E5E7EB" : "#000",
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
                          if (followState.isBlocked || !followState.isFollowing) return;
                          startCall("video");
                          setShowCallOptions(false);
                        }}
                        disabled={isBlocked}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "none",
                          background: theme === "dark" ? "#020617" : "#FFFFFF",
                          color: theme === "dark" ? "#E5E7EB" : "#000",
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

                <button
                  onClick={() => {
                    setSelectedThread(null);
                    localStorage.removeItem("active_thread");
                  }}
                  title="Close chat"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: theme === "dark" ? "#CBD5F5" : "#1C1E21",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme === "dark" ? "#1E293B" : "#E4E6EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  x
                </button>

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
                      color: theme === "dark" ? "#E5E7EB" : "#000",
                      border: theme === "dark" ? "1px solid #1E293B" : "1px solid #ddd",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                      minWidth: "190px",
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
                          const next = themeMode === "auto" ? "dark" : themeMode === "dark" ? "light" : "auto";
                          setThemeMode(next);
                          localStorage.setItem("theme", next);
                          
                          if (next === "auto") {
                            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                            setTheme(isDark ? "dark" : "light");
                          } else {
                            setTheme(next);
                          }
                          
                          setShowMenu(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 14
                        }}
                      >
                        {themeMode === "auto" ? "🌓 Auto Theme" : themeMode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
                      </div>
                    
                      
                      <MenuItem
                        theme={theme}
                        label={followState.isBlocked ? "🔓 Unblock User" : "🚫 Block User"}
                        onClick={async () => {
                          if (!activeOtherUser) return;

                          // ❌ SELF BLOCK PROTECTION
                          if (activeOtherUser.username === currentUser?.username) {
                            alert("You cannot block yourself");
                            return;
                          }

                          setShowMenu(false); // ✅ menu pehle band

                          try {
                            if (!followState.isBlocked) {
                              // 🚫 BLOCK USER
                              if (followState.isBlocked) {
                                console.log("Already blocked");
                                return;
                              }

                              await blockUser(activeOtherUser.username);

                              syncFollowState(
                                activeOtherUser.id,
                                false, // unfollow
                                true   // blocked
                              );
                            } else {
                              // 🔓 UNBLOCK USER
                              await unblockUser(activeOtherUser.username);

                              syncFollowState(
                                activeOtherUser.id,
                                false,
                                false
                              );
                            }

                            await refreshThreads();

                          } catch (err) {
                            console.error("❌ Block/unblock failed:", err.response?.data);
                            alert(err.response?.data?.error || "Action failed");
                            refreshThreads(); // rollback
                          }
                        }}
                      />

                      <MenuItem
                        theme={theme}
                        label={followState.isFollowing ? "❌ Unfollow" : "✅ Follow"}
                        onClick={async () => {
                          if (!activeOtherUser) {
                            console.error("No active user found");
                            return;
                          }

                          try {
                            setShowMenu(false);  // ✅ CLOSE MENU FIRST
                            
                            if (followState.isFollowing) {
                              // UNFOLLOW
                              console.log("❌ Unfollowing user:", activeOtherUser.username);
                              await api.post(`/auth/unfollow/${activeOtherUser.username}/`);
                              
                              // ✅ UPDATE UI IMMEDIATELY
                              syncFollowState(
                                activeOtherUser.id,
                                false,  // unfollowed
                                false   // not blocked
                              );

                              await refreshThreads();
                              
                            } else {
                              // FOLLOW
                              console.log("✅ Following user:", activeOtherUser.username);
                              await api.post(`/auth/follow/${activeOtherUser.username}/`);
                              
                              // ✅ UPDATE UI IMMEDIATELY
                              syncFollowState(
                                activeOtherUser.id,
                                true,   // following
                                false   // not blocked
                              );
                            }

                            await refreshThreads();

                            // ✅ REFRESH FROM SERVER AFTER DELAY
                            setTimeout(() => refreshThreads(), 500);

                          } catch (err) {
                            console.error("❌ Follow toggle failed:", err);
                            console.error("Error response:", err.response?.data);
                            
                            const errorMsg = err.response?.data?.error 
                              || err.response?.data?.detail 
                              || err.message;
                            
                            alert(`Action failed: ${errorMsg}`);
                            
                            // ✅ REVERT UI ON ERROR
                            refreshThreads();
                          }
                        }}
                      />


                      <MenuItem
                        theme={theme}
                        label="🗑️ Delete Chat"
                        onClick={() => handleDeleteThread(selectedThread.id)}
                      />

                    </div>
                  )}
                </div>
              </div>
            

              {showSearch && (
              <div style={{
                padding: '14px 20px',
                borderBottom: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
                backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF"
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
                    fontSize: '15px',        // 🔥 text thoda bada
                    outline: 'none',
                    backgroundColor: theme === "dark" ? "#020617" : "#F0F2F5",
                    color: theme === "dark" ? "#E5E7EB" : "#000",
                    border: theme === "dark" ? "1px solid #1E293B" : "1px solid #DADDE1",
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
                    
                    if (callType === "video") {
                      setCallMode("video");
                      if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                      }
                    } else {
                      setCallMode("audio");
                    }
                    
                    setCallStatus("connected"); 
                    
                    if (!callSocketRef.current || callSocketRef.current.readyState !== WebSocket.OPEN) {
                      alert("Call connection not ready");
                      return;
                    }
                    
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
                    if (
                      callSocketRef.current &&
                      callSocketRef.current.readyState === WebSocket.OPEN
                    ) {
                      callSocketRef.current.send(JSON.stringify({
                        type: "call:reject",
                      }));
                    }
                    
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

              {/* Messages Container  */}

                <div
                  style={{
                    flex: 1,

                    overflowY: "auto",          // ✅ MUST
                    overflowX: "hidden",

                    backgroundColor: themeData?.value?.background || "#0b141a",
                    backgroundImage: themeData?.value?.pattern,
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",

                    padding: "16px 20px",       // ✅ padding yahin honi chahiye
                    backgroundAttachment: "fixed" // ✅ WhatsApp feel
                  }}
                >
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
                    const otherUser = selectedThread?.members?.find(
                      m => m.id !== currentUser?.id
                    );
                    const isOwn =
                      msg.sender?.id === currentUser?.id;

                    const prevMsg = filteredMessages[idx - 1];
                    const showAvatar =
                      !isOwn &&
                      (!prevMsg || prevMsg.sender?.id !== msg.sender?.id);

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
                              flexShrink: 0,
                              visibility: showAvatar ? 'visible' : 'hidden'
                            }}>
                              {otherUser?.avatar_url ? (
                                <img
                                  src={otherUser.avatar_url}
                                  alt={otherUser.username}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  background: '#E4E6EB',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 600,
                                  color: '#65676B'
                                }}>
                                  {getInitials(otherUser?.username)}
                                </div>
                              )}
                            </div>
                          )}


                          <div
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setShowReactions(msg.id);
                            }}

                            onTouchStart={(e) => {
                              touchStartXRef.current = e.touches[0].clientX;
                              touchMovedRef.current = false;

                              longPressTimerRef.current = setTimeout(() => {
                                // 🔥 LONG PRESS (no swipe happened)
                                if (!touchMovedRef.current) {
                                  setShowReactions(msg.id);
                                }
                              }, 500);
                            }}

                            onTouchMove={(e) => {
                              const currentX = e.touches[0].clientX;
                              const diff = currentX - touchStartXRef.current;

                              if (Math.abs(diff) > 10) {
                                touchMovedRef.current = true;
                                clearTimeout(longPressTimerRef.current);
                              }

                              // 👉 SWIPE RIGHT TO REPLY
                              if (!isOwn && diff > 80) {
                                setReplyingTo(msg);
                                clearTimeout(longPressTimerRef.current);
                                touchStartXRef.current = 0;
                              }
                            }}

                            onTouchEnd={() => {
                              clearTimeout(longPressTimerRef.current);
                              touchStartXRef.current = 0;
                            }}

                            style={{
                              padding: '8px 12px',
                              borderRadius: '16px',
                              backgroundColor: isOwn
                                ? "#2563EB"
                                : theme === "dark"
                                ? "#1E293B"
                                : "#E4E6EB",
                              color: isOwn ? "#FFFFFF" : theme === "dark" ? "#FFFFFF" : "#000000",
                              wordWrap: "break-word",
                              position: "relative",
                              maxWidth: "400px",
                              cursor: "pointer",
                              userSelect: "none"
                            }}
                          >
                            {/* DELETE BUTTON – only for own message */}
                            {isOwn && (
                              <button
                                onClick={() => {
                                  if (!window.confirm("Delete this message?")) return;
                                  handleDeleteMessage(msg.id);
                                }}
                                style={{
                                  position: "absolute",
                                  top: "-6px",
                                  right: "-6px",
                                  background: "#ef4444",
                                  color: "#fff",
                                  borderRadius: "50%",
                                  width: "18px",
                                  height: "18px",
                                  fontSize: "10px",
                                  cursor: "pointer",
                                  border: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                title="Delete message"
                              >
                                x
                              </button>
                            )}

                            {/* 😍 REACTION POPUP */}
                            {showReactions === msg.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  bottom: '-50px',
                                  left: isOwn ? 'auto' : '0',
                                  right: isOwn ? '0' : 'auto',
                                  background: theme === "dark" ? "#1E293B" : "#FFFFFF",
                                  borderRadius: '25px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  gap: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                  zIndex: 1000
                                }}
                              >
                                {reactionEmojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      setMessageReactions(prev => ({
                                        ...prev,
                                        [msg.id]: emoji
                                      }));
                                      setShowReactions(null);
                                    }}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      border: 'none',
                                      background: 'transparent',
                                      fontSize: '20px',
                                      cursor: 'pointer',
                                      borderRadius: '50%',
                                      transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}

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

                             {/* 💬 REPLIED MESSAGE */}
                             {msg.reply_to && (
                              <div style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                                marginBottom: '8px',
                                borderLeft: '3px solid #0084FF'
                              }}>
                                <div style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#0084FF',
                                  marginBottom: '2px'
                                }}>
                                  {msg.reply_to.sender}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  opacity: 0.8
                                }}>
                                  {msg.reply_to.text}
                                </div>
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

              {/* 💬 REPLY PREVIEW */}
              {replyingTo && (
                <div style={{
                  padding: '12px 20px',
                  borderTop: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
                  backgroundColor: theme === "dark" ? "#0F172A" : "#F8F9FA",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    flex: 1,
                    borderLeft: '3px solid #0084FF',
                    paddingLeft: '12px'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0084FF',
                      marginBottom: '4px'
                    }}>
                      Replying to {replyingTo.sender.username}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: theme === "dark" ? "#94A3B8" : "#65676B",
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {replyingTo.text}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: theme === "dark" ? "#1E293B" : "#E4E6EB",
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21",
                      cursor: 'pointer',
                      fontSize: '16px'
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
                    if (followState.isBlocked || !followState.isFollowing) return;
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
                    followState.isBlocked
                      ? "You blocked this user"
                      : !followState.isFollowing
                        ? "Follow user to send message"
                        : "Type a message..."
                  }
                  disabled={sending || followState.isBlocked || !followState.isFollowing}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    outline: "none",

                    border:
                      theme === "dark"
                        ? "1px solid #1E293B"
                        : "1px solid #E4E6EB",

                    backgroundColor:
                      followState.isBlocked || !followState.isFollowing
                        ? "#334155"          // 🔒 locked look
                        : theme === "dark"
                          ? "#020617"
                          : "#F0F2F5",

                    color:
                      followState.isBlocked || !followState.isFollowing
                        ? "#94A3B8"          // 🔒 grey text
                        : theme === "dark"
                          ? "#E5E7EB"
                          : "#1C1E21",

                    cursor:
                      followState.isBlocked || !followState.isFollowing
                        ? "not-allowed"
                        : "text",

                    transition: "all 0.15s",
                  }}
                  onFocus={(e) => {
                    if (followState.isBlocked || !followState.isFollowing) return;
                    e.target.style.borderColor = "#0084FF";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "dark" ? "#1E293B" : "#E4E6EB";
                  }}
                />

                <div style={{ position: 'relative' }}>
                  {/* Emoji Button */}
                  <button
                    onClick={() => {
                      if (followState.isBlocked || !followState.isFollowing) return;
                      setShowEmojiPicker(prev => !prev);
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme === "dark" ? "#1E293B" : "#F0F2F5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    😊
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '50px',
                        right: 0,
                        backgroundColor: theme === "dark" ? "#020617" : "#FFFFFF",
                        border: theme === "dark" ? "1px solid #1E293B" : "1px solid #E4E6EB",
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '8px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                    >
                      {commonEmojis.map((emoji, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setMessageInput(prev => prev + emoji); // ✅ emoji add
                            setShowEmojiPicker(false);             // ✅ picker close
                          }}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              theme === "dark" ? "#1E293B" : "#F0F2F5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🎤 VOICE RECORDING UI */}
                {isRecording ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 1.5s infinite'
                    }} />
                    <div style={{
                      fontSize: '14px',
                      color: theme === "dark" ? "#E5E7EB" : "#1C1E21"
                    }}>
                      {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                    </div>
                    
                    <button
                      onClick={cancelRecording}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#ef4444',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#22c55e',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      ➤
                    </button>
                  </div>
                ) : (
                  <>
                    {(messageInput.trim() || selectedFile) ? (
                      <button 
                        onClick={handleSendMessage}
                        disabled={sending || followState.isBlocked}
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
                      >
                        {sending ? '...' : '➤'}
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        disabled={followState.isBlocked || !followState.isFollowing}
                        title="Voice message"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#0084FF',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        🎤
                      </button>
                    )}
                  </>
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

          {showAvatarPreview && avatarPreviewUrl && (
            <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center">
              
              <button
                onClick={() => {
                  setShowAvatarPreview(false);
                  setAvatarPreviewUrl(null);
                }}
                className="absolute top-6 right-6 text-white text-3xl"
              >
                ✕
              </button>

              <img
                src={avatarPreviewUrl}
                className="max-w-[90%] max-h-[90%] object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}  