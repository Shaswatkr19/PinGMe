import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/token/",
        {
          username,
          password,
        }
      );
  
      // ✅ Save JWT tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
  
      // // ✅ Optional success message
      // alert("Welcome to PingMe! 🎉");
  
      // 🔥 HARD reload so app state resets properly
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const floatingMessages = [
    { text: "Hey! What's up? 👋", delay: "0s", top: "15%", left: "10%" },
    { text: "Let's catch up! 💬", delay: "2s", top: "25%", right: "15%" },
    { text: "New message! 🔔", delay: "4s", bottom: "20%", left: "8%" },
    { text: "Squad online! 🎮", delay: "3s", top: "40%", right: "12%" },
    { text: "Coffee? ☕", delay: "1s", bottom: "35%", left: "20%" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-indigo-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* SaaS Style Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Floating Chat Bubbles - Hidden on mobile/tablet, visible on large screens */}
      {floatingMessages.map((msg, idx) => (
        <div
          key={idx}
          className="absolute hidden xl:block animate-float opacity-0"
          style={{
            top: msg.top,
            bottom: msg.bottom,
            left: msg.left,
            right: msg.right,
            animationDelay: msg.delay,
            animationDuration: "6s"
          }}
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-blue-400/30 text-blue-200 text-sm font-medium shadow-lg">
            {msg.text}
          </div>
        </div>
      ))}

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Main Container - Responsive width and padding */}
      <div className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] px-4 sm:px-0">
        {/* Logo & Title Section - Adjusted spacing for mobile */}
        <div className="text-center mb-14 space-y-4">
        {/* <div className="text-center mb-8 sm:mb-10 space-y-3 sm:space-y-4"> */}
          {/* Logo */}
          {/* <div className="inline-flex items-center justify-center mb-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[24px] sm:rounded-[28px] blur-xl opacity-60 group-hover:opacity-80 transition duration-500"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-500 rounded-[24px] sm:rounded-[28px] p-0.5 transform group-hover:scale-105 transition duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[22px] sm:rounded-[26px] flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div> */}

          {/* Title */}
          <div>
          <h1 className="text-7xl sm:text-9xl font-black mb-4 flex justify-center items-baseline space-x-[-0.5rem] sm:space-x-[-1rem] py-4">
            {/* P - Thoda left tilt */}
            <span className="inline-block -rotate-6 bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              P
            </span>
            {/* i - Thoda right tilt aur niche */}
            <span className="inline-block rotate-12 translate-y-4 bg-gradient-to-br from-pink-500 to-red-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              i
            </span>
            {/* n - Wapas left tilt */}
            <span className="inline-block -rotate-3 bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              n
            </span>
            {/* g - Zyada right tilt */}
            <span className="inline-block rotate-[15deg] translate-y-2 bg-gradient-to-br from-green-500 to-teal-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              g
            </span>
            {/* M - Heavy left tilt */}
            <span className="inline-block -rotate-12 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              M
            </span>
            {/* e - Slight right */}
            <span className="inline-block rotate-6 translate-y-3 bg-gradient-to-br from-red-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
              e
            </span>
          </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium tracking-wide">
              Connect • Chat • Vibe 
            </p>
          </div>
        </div>

        {/* Login Card - Adjusted padding for mobile */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-[28px] sm:rounded-[32px] blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
          
          {/* Card */}
        <form onSubmit={handleLogin}>  
          <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-800/50 shadow-2xl">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome back 👋</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Enter your credentials to access your account</p>
            </div>

            {/* Error Message - Mobile optimized */}
            {error && (
              <div className="mb-5 sm:mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 animate-pulse"></div>
                <div className="relative bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 backdrop-blur-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/50">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-400 text-xs sm:text-sm font-semibold">{error}</p>
                    <p className="text-red-400/70 text-[10px] sm:text-xs mt-0.5 hidden sm:block">Please check your credentials and try again</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Fields - Mobile optimized */}
            <div className="space-y-4 sm:space-y-5 mb-5 sm:mb-6">
              {/* Username - Mobile optimized */}
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <span>Username</span>
                  <span className="text-purple-400 text-xs">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-purple-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                </div>
              </div>

              {/* Password - Mobile optimized */}
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <span>Password</span>
                  <span className="text-purple-400 text-xs">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-purple-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot - Mobile optimized */}
            <div className="flex items-center justify-between mb-5 sm:mb-7">
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-800 border-2 border-slate-700 rounded-md sm:rounded-lg peer-checked:bg-gradient-to-br peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-transparent transition-all duration-300 group-hover:border-slate-600"></div>
                  <svg className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-all duration-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-300 text-xs sm:text-sm font-medium group-hover:text-white transition">Keep me signed in</span>
              </label>
              <Link to="/password-reset" className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-semibold transition flex items-center gap-1 group">
                <span>Forgot?</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Login Button - Mobile optimized */}
          
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn mb-5 sm:mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover/btn:opacity-75 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 transform group-hover/btn:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to PingMe</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover/btn:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          
          

            {/* Divider - Mobile optimized */}
            <div className="relative my-5 sm:my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 sm:px-4 text-gray-500 font-bold tracking-wider">Or continue with</span>
              </div>
            </div>

            {/* Social Login - Mobile optimized */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <button className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              <button className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/0 via-pink-600/10 to-pink-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z"/>
                </svg>
              </button>
              <button className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/10 to-cyan-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>  
        </div>

        {/* Sign Up Link - Mobile optimized */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-400 text-xs sm:text-sm">
            New to PingMe?{' '}
            <Link to="/register" className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-bold hover:from-purple-300 hover:to-pink-300 transition">
              Create your account
            </Link>
          </p>
        </div>

        {/* Footer - Bigger & Clean */}
        <div className="text-center mt-12 sm:mt-14 space-y-4">

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8
                          text-base sm:text-lg text-gray-500">
            
            <Link to="/about" className="hover:text-purple-400 transition">
              About
            </Link>

            <span>•</span>

            <Link to="/privacy" className="hover:text-purple-400 transition">
              Privacy
            </Link>

            <span>•</span>

            <Link to="/terms" className="hover:text-purple-400 transition">
              Terms
            </Link>

            <span>•</span>

            <Link to="/support" className="hover:text-purple-400 transition">
              Support
            </Link>

          </div>

          <p className="text-sm sm:text-base text-gray-600">
            © 2026 PingMe • End-to-end encrypted conversations
          </p>

        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0;
          }
          10% { opacity: 1; }
          50% { transform: translateY(-20px) scale(1.05); opacity: 1; }
          90% { opacity: 1; }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}