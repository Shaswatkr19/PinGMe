import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, checkUsernameAvailability } from "../api/auth.api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null, "checking", "available", "not-available"
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // Real-time username availability check with debounce
  useEffect(() => {
    if (username.trim().length < 3) {
      setUsernameStatus(null);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setUsernameStatus("checking");

    // Debounce API call (300ms)
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(username.trim());
        setUsernameStatus(res.data.available ? "available" : "not-available");
      } catch (err) {
        setUsernameStatus(null);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [username]);

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith("@gmail.com")) {
      setEmailError("Only Gmail addresses are allowed");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (pwd) => {
    if (!pwd) {
      setPasswordError("Password is required");
      return false;
    }
    if (pwd.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (usernameStatus !== "available") {
      setError("Please choose an available username");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password,
      });

      // Success - redirect to login
      navigate("/login", { state: { message: "Account created successfully! Please login." } });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.email?.[0] || 
                      err.response?.data?.username?.[0] || 
                      err.response?.data?.password?.[0] ||
                      err.response?.data?.detail ||
                      "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatusColor = () => {
    if (usernameStatus === "checking") return "text-gray-400";
    if (usernameStatus === "available") return "text-green-400";
    if (usernameStatus === "not-available") return "text-red-400";
    return "text-gray-500";
  };

  const getUsernameStatusText = () => {
    if (usernameStatus === "checking") return "Checking...";
    if (usernameStatus === "available") return "Available";
    if (usernameStatus === "not-available") return "Not available";
    if (username.trim().length > 0 && username.trim().length < 3) return "At least 3 characters";
    return "";
  };

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-indigo-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects - same as Login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] px-4 sm:px-0">
        {/* Title */}
        <div className="text-center mb-14 space-y-4">
          <div>
            <h1 className="text-7xl sm:text-9xl font-black mb-4 flex justify-center items-baseline space-x-[-0.5rem] sm:space-x-[-1rem] py-4">
              <span className="inline-block -rotate-6 bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                P
              </span>
              <span className="inline-block rotate-12 translate-y-4 bg-gradient-to-br from-pink-500 to-red-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                i
              </span>
              <span className="inline-block -rotate-3 bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                n
              </span>
              <span className="inline-block rotate-[15deg] translate-y-2 bg-gradient-to-br from-green-500 to-teal-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                g
              </span>
              <span className="inline-block -rotate-12 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                M
              </span>
              <span className="inline-block rotate-6 translate-y-3 bg-gradient-to-br from-red-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all">
                e
              </span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium tracking-wide">
              Create your account
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-[28px] sm:rounded-[32px] blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
          
          <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-800/50 shadow-2xl">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sign up 🚀</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Enter your details to create an account</p>
            </div>

            {/* Error Message */}
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
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <span>Gmail</span>
                  <span className="text-purple-400 text-xs">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-purple-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                </div>
                {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
              </div>

              {/* Username Field */}
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
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                  {usernameStatus && (
                    <div className={`absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-xs sm:text-sm font-semibold ${getUsernameStatusColor()}`}>
                      {getUsernameStatusText()}
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) validatePassword(e.target.value);
                    }}
                    onBlur={() => validatePassword(password)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                  <button
                    type="button"
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
                {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <span>Confirm Password</span>
                  <span className="text-purple-400 text-xs">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-purple-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-300 transition"
                  >
                    {showConfirmPassword ? (
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
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || usernameStatus !== "available"}
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover/btn:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-bold hover:from-purple-300 hover:to-pink-300 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
