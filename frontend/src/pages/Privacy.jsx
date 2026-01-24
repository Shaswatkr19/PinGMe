import { MessageCircle, Shield, Lock, Eye, Database, FileCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-200">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">PingMe</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-12 h-12 text-purple-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>
        <p className="text-xl text-gray-400 leading-relaxed">
          Your privacy is our top priority. Learn how we protect your data and 
          respect your rights while using PingMe.
        </p>
        <p className="text-sm text-gray-500 mt-4">Last Updated: January 2024</p>
      </section>

      {/* Privacy Features */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">
            <Lock className="w-10 h-10 text-green-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-gray-400">
              All your messages are encrypted on your device and can only be read by you and your recipient.
            </p>
          </div>

          <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">
            <Eye className="w-10 h-10 text-blue-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">No Data Mining</h3>
            <p className="text-gray-400">
              We don't scan, analyze, or use your messages for advertising or any other purposes.
            </p>
          </div>

          <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">
            <Database className="w-10 h-10 text-purple-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Minimal Data Storage</h3>
            <p className="text-gray-400">
              We only store essential information needed to provide our service. Your conversations aren't stored on our servers.
            </p>
          </div>

          <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">
            <FileCheck className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Full Transparency</h3>
            <p className="text-gray-400">
              We're open about our practices and regularly update our privacy policy to reflect any changes.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Information We Collect</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">Account Information:</span> When you create an account, 
                we collect your phone number or email address to verify your identity and enable account recovery.
              </p>
              <p>
                <span className="font-semibold text-white">Profile Data:</span> Your display name, profile picture, 
                and status message are stored to personalize your experience.
              </p>
              <p>
                <span className="font-semibold text-white">Usage Data:</span> We collect minimal analytics data 
                like app performance metrics to improve service quality.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">How We Protect Your Data</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">End-to-End Encryption:</span> Your messages are encrypted 
                using industry-standard protocols. Only you and your recipient can read them.
              </p>
              <p>
                <span className="font-semibold text-white">Secure Storage:</span> Any data we do store is encrypted 
                at rest and protected by multiple layers of security.
              </p>
              <p>
                <span className="font-semibold text-white">No Third-Party Access:</span> We never sell or share 
                your personal information with advertisers or data brokers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Your Rights</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">Access Your Data:</span> You can request a copy of 
                all data we have about you at any time.
              </p>
              <p>
                <span className="font-semibold text-white">Delete Your Account:</span> You have the right to 
                permanently delete your account and all associated data.
              </p>
              <p>
                <span className="font-semibold text-white">Control Your Privacy:</span> Manage who can see your 
                profile, last seen status, and online presence through privacy settings.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Data Retention</h2>
            <p className="text-gray-300">
              Messages are stored on your device only. We don't keep copies of your conversations on our servers. 
              Account information is retained as long as your account is active. After account deletion, 
              all your data is permanently removed within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Contact Us</h2>
            <p className="text-gray-300">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at{' '}
              <a href="mailto:privacy@pingme.app" className="text-purple-400 hover:text-purple-300 underline">
                privacy@pingme.app
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-500" />
              <span className="font-semibold">PingMe</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 PingMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}