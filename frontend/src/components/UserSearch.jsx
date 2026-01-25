import { useState, useEffect } from "react";
import { searchUsers, followUser, unfollowUser } from "../api/auth.api";
import { createThread } from "../api/chat.api";
import api from "../api/axios";

export default function UserSearch({ searchQuery, onThreadSelect, currentUser, onFollowUpdate, onUserClick, }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState({}); // { userId: true/false }
  const [actionLoading, setActionLoading] = useState({}); // { userId: "follow" | "unfollow" | "message" }

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers(searchQuery.trim());
        const results = res.data;
        setSearchResults(results);
        
        // Initialize following states
        const states = {};
        results.forEach(user => {
          states[user.id] = user.is_following;
        });
        setFollowingStates(states);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollow = async (user) => {
    setActionLoading({ ...actionLoading, [user.id]: "follow" });
    try {
      await followUser(user.username);
      setFollowingStates({ ...followingStates, [user.id]: true });
      if (onFollowUpdate) onFollowUpdate();
    } catch (err) {
      console.error("Follow error:", err);
      alert(err.response?.data?.error || "Failed to follow user");
    } finally {
      setActionLoading({ ...actionLoading, [user.id]: null });
    }
  };

  const handleUnfollow = async (user) => {
    setActionLoading({ ...actionLoading, [user.id]: "unfollow" });
    try {
      await unfollowUser(user.username);
      setFollowingStates({ ...followingStates, [user.id]: false });
      if (onFollowUpdate) onFollowUpdate();
    } catch (err) {
      console.error("Unfollow error:", err);
      alert(err.response?.data?.error || "Failed to unfollow user");
    } finally {
      setActionLoading({ ...actionLoading, [user.id]: null });
    }
  };

  const handleMessage = async (user) => {
    if (!followingStates[user.id]) {
      alert("You must follow this user to start a chat");
      return;
    }

    setActionLoading({ ...actionLoading, [user.id]: "message" });
    try {
      const res = await createThread(user.username);
      if (onThreadSelect) {
        onThreadSelect(res.data);
      }
      // Clear search results after selecting thread
      setSearchResults([]);
    } catch (err) {
      console.error("Create thread error:", err);
      const errorMsg = err.response?.data?.error || "Failed to create chat";
      if (errorMsg.includes("follow")) {
        alert("You must follow this user to start a chat");
        setFollowingStates({ ...followingStates, [user.id]: false });
      } else {
        alert(errorMsg);
      }
    } finally {
      setActionLoading({ ...actionLoading, [user.id]: null });
    }
  };

  const getAvatarUrl = (user) => {
    if (user.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`;
    }
    return null;
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  if (searchQuery.trim().length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-gray-400">
          <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm">Searching...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-sm">
          No users found
        </div>
      ) : (
        <div className="py-2">
          {searchResults.map((user) => {
            const isFollowing = followingStates[user.id] || false;
            const isLoading = actionLoading[user.id];

            return (
              <div
                key={user.id}
                onClick={() => {
                  if (onUserClick) onUserClick(user);
                }}
                className="px-4 py-3 hover:bg-slate-700/50 transition-colors flex items-center gap-3 border-b border-slate-700/50 last:border-0 cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {getAvatarUrl(user) ? (
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-600">
                      {getInitials(user.username)}
                    </div>
                  )}
                  {user.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">
                      {user.username}
                    </p>
                    {user.is_online && (
                      <span className="text-xs text-green-400">●</span>
                    )}
                  </div>
                  {user.bio ? (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.followers_count || 0} followers
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {isFollowing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfollow(user);
                        }}  
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading === "unfollow" ? "..." : "Unfollow"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessage(user);
                        }}  
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading === "message" ? "..." : "Message"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user);
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading === "follow" ? "..." : "Follow to chat"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
