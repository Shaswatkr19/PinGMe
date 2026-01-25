export default function AppearanceSection({ theme, setTheme }) {
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Appearance</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Theme
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 p-4 rounded-lg border-2 transition ${
                theme === "light"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="text-3xl mb-2">🌞</div>
              <div className="font-semibold text-white">Light</div>
              <div className="text-xs text-gray-400 mt-1">Clean and bright</div>
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 p-4 rounded-lg border-2 transition ${
                theme === "dark"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="text-3xl mb-2">🌙</div>
              <div className="font-semibold text-white">Dark</div>
              <div className="text-xs text-gray-400 mt-1">Easy on the eyes</div>
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Your theme preference is saved automatically and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
