export default function AccountSection() {
  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("active_thread");
    localStorage.removeItem("theme");

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Account</h3>

      <div className="space-y-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Sign Out</h4>
          <p className="text-sm text-gray-400 mb-4">
            Sign out of your account. You'll need to log in again to access your chats.
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>

        <div className="p-4 bg-slate-800 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Account Information</h4>
          <p className="text-sm text-gray-400">
            For security reasons, account deletion and password changes are not available in this version.
          </p>
        </div>
      </div>
    </div>
  );
}
