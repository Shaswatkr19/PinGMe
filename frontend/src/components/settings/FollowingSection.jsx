import { useState, useEffect } from "react";
import { getFollowing, unfollowUser } from "../../api/auth.api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function FollowingSection() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowing, setUnfollowing] = useState({});

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      const res = await getFollowing();
      setFollowing(res.data);
    } catch (err) {
      console.error("Failed to load following:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (user) => {
    setUnfollowing({ ...unfollowing, [user.id]: true });
    try {
      await unfollowUser(user.username);
      setFollowing(following.filter(u => u.id !== user.id));
    } catch (err) {
      console.error("Failed to unfollow:", err);
      alert(err.response?.data?.error || "Failed to unfollow user");
    } finally {
      setUnfollowing({ ...unfollowing, [user.id]: false });
    }
  };

  const getAvatarUrl = (user) => {
    if (user.avatar_url) return user.avatar_url;
    if (!user.avatar) return null;
  
    if (user.avatar.startsWith("http")) return user.avatar;
  
    return `${API_BASE}${user.avatar}`;
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Following</h3>

      {following.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">➕</div>
          <p className="text-gray-400">You're not following anyone yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              {/* Avatar */}
              {getAvatarUrl(user) ? (
                <img
                  src={getAvatarUrl(user)}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {getInitials(user.username)}
                </div>
              )}

              {/* User Info */}
              <div className="flex-1">
                <div className="font-semibold text-white">{user.username}</div>
                {user.bio && (
                  <div className="text-sm text-gray-400 truncate">{user.bio}</div>
                )}
              </div>

              {/* Unfollow Button */}
              <button
                onClick={() => handleUnfollow(user)}
                disabled={unfollowing[user.id]}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unfollowing[user.id] ? "..." : "Unfollow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
