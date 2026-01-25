import { useState, useRef, useEffect } from "react";

export default function ProfileSection({ user, onUpdate, onUserUpdate }) {
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  // Update preview when user changes
  useEffect(() => {
    if (user) {
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      } else if (user.avatar) {
        const avatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `http://127.0.0.1:8000${user.avatar}`;
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview(null);
      }
      setBio(user.bio || "");
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Don't save if nothing changed
    const bioChanged = bio.trim() !== (user?.bio || "");
    const avatarChanged = selectedFile !== null;
    
    if (!bioChanged && !avatarChanged) {
      setError("No changes to save");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await onUpdate({
      bio: bio.trim(),
      avatar: selectedFile,
    });

    if (result.success) {
      setSuccess(true);
      setSelectedFile(null);
      
      // Update avatar preview with new URL from server
      if (result.user?.avatar_url) {
        setAvatarPreview(result.user.avatar_url);
      } else if (result.user?.avatar) {
        const avatarUrl = result.user.avatar.startsWith('http') 
          ? result.user.avatar 
          : `http://127.0.0.1:8000${result.user.avatar}`;
        setAvatarPreview(avatarUrl);
      } else {
        // If avatar was removed, clear preview
        setAvatarPreview(null);
      }
      
      // Update parent user state (this will trigger re-render in ChatLayout)
      if (onUserUpdate && result.user) {
        onUserUpdate(result.user);
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Profile</h3>

      {/* Avatar Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 cursor-pointer hover:opacity-80 transition"
                onClick={() => setShowAvatarPreview(true)}
              />
            ) : (
              <div
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold cursor-pointer hover:opacity-80 transition border-2 border-purple-500"
              >
                {getInitials(user?.username)}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-500 transition border-2 border-slate-900" onClick={handleAvatarClick}>
              <span className="text-white text-sm">📷</span>
            </div>
          </div>
          <div>
            <button
              onClick={handleAvatarClick}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm font-medium"
            >
              Change Photo
            </button>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG or GIF. Max size 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Username (Read-only) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          value={user?.username || ""}
          disabled
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={150}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {bio.length}/150 characters
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-6">
        <div>
          <div className="text-2xl font-bold text-white">
            {user?.followers_count || 0}
          </div>
          <div className="text-sm text-gray-400">Followers</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {user?.following_count || 0}
          </div>
          <div className="text-sm text-gray-400">Following</div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Profile updated successfully!
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading || (!selectedFile && bio === (user?.bio || ""))}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Saving...</span>
          </>
        ) : (
          <span>Save Changes</span>
        )}
      </button>

      {showAvatarPreview && avatarPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          
          {/* Close Button */}
          <button
            onClick={() => setShowAvatarPreview(false)}
            className="absolute top-6 right-6 text-white text-4xl font-bold hover:scale-110 transition"
          >
            ✕
          </button>

          {/* Full Image */}
          <img
            src={avatarPreview}
            alt="Profile Preview"
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
