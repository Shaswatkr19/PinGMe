import { useState, useEffect } from "react";
import { getCurrentUser, updateProfile } from "../api/auth.api";
import ProfileSection from "../components/settings/ProfileSection";
import FollowersSection from "../components/settings/FollowersSection";
import FollowingSection from "../components/settings/FollowingSection";
import BlockedUsersSection from "../components/settings/BlockedUsersSection";
import AppearanceSection from "../components/settings/AppearanceSection";
import AccountSection from "../components/settings/AccountSection";

export default function Settings({ onClose, theme, setTheme, onUserUpdate }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      const formData = new FormData();
      if (data.bio !== undefined) {
        formData.append("bio", data.bio);
      }
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }
      
      const res = await updateProfile(formData);
      
      const updatedUser = res.data;
      
      // Update local state
      setUser(updatedUser);
      
      // Notify parent component to update currentUser (ChatLayout)
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.avatar?.[0] || 
                      err.response?.data?.bio?.[0] ||
                      err.response?.data?.error || 
                      err.response?.data?.detail || 
                      "Failed to update profile";
      return { 
        success: false, 
        error: errorMsg
      };
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "followers", label: "Followers", icon: "👥" },
    { id: "following", label: "Following", icon: "➕" },
    { id: "blocked", label: "Blocked Users", icon: "🚫" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "account", label: "Account", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex overflow-hidden"
        style={{ maxHeight: "800px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 text-x1 hover:text-white hover:bg-slate-700 transition"
              >
                ❌
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-slate-700"
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900">
          <div className="p-6">
            {activeSection === "profile" && (
              <ProfileSection user={user} onUpdate={handleProfileUpdate} onUserUpdate={setUser} />
            )}
            {activeSection === "followers" && (
              <FollowersSection />
            )}
            {activeSection === "following" && (
              <FollowingSection />
            )}
            {activeSection === "blocked" && (
              <BlockedUsersSection />
            )}
            {activeSection === "appearance" && (
              <AppearanceSection theme={theme} setTheme={setTheme} />
            )}
            {activeSection === "account" && (
              <AccountSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
