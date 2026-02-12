import { useState, useEffect } from "react";
import { getFollowers } from "../../api/auth.api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function FollowersSection() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      const res = await getFollowers();
      setFollowers(res.data);
    } catch (err) {
      console.error("Failed to load followers:", err);
    } finally {
      setLoading(false);
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
      <h3 className="text-2xl font-bold text-white mb-6">Followers</h3>

      {followers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-400">No followers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followers.map((user) => (
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

              {/* Online Status */}
              {user.is_online && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
