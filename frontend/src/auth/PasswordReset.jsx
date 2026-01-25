import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed");
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(emailLower);
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail ||
                      "Failed to send reset email. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-indigo-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
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
              <span className="inline-block -rotate-6 bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                P
              </span>
              <span className="inline-block rotate-12 translate-y-4 bg-gradient-to-br from-pink-500 to-red-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                i
              </span>
              <span className="inline-block -rotate-3 bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                n
              </span>
              <span className="inline-block rotate-[15deg] translate-y-2 bg-gradient-to-br from-green-500 to-teal-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                g
              </span>
              <span className="inline-block -rotate-12 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                M
              </span>
              <span className="inline-block rotate-6 translate-y-3 bg-gradient-to-br from-red-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
                e
              </span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium tracking-wide">
              Reset your password
            </p>
          </div>
        </div>

        {/* Reset Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-[28px] sm:rounded-[32px] blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
          
          <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-800/50 shadow-2xl">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Forgot Password? 🔐</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Enter your Gmail to receive a reset link</p>
            </div>

            {success ? (
              <div className="mb-5 sm:mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
                <div className="relative bg-green-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 backdrop-blur-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/50">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 text-xs sm:text-sm font-semibold">
                      If the email exists, a password reset link has been sent to your inbox.
                    </p>
                    <p className="text-green-400/70 text-[10px] sm:text-xs mt-1">
                      Please check your email and click the reset link.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
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

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 hover:border-slate-600"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
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
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover/btn:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                Remember your password?{' '}
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
