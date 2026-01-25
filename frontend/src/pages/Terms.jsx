import { MessageCircle, FileText, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-200">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-[#0a0f1e] flex items-center">
        <div className="w-full px-6 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-500" />
            <span className="text-lg font-semibold">PingMe</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-12 h-12 text-purple-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
        </div>
        <p className="text-xl text-gray-400 leading-relaxed">
          Please read these terms carefully before using PingMe. By accessing or using our service, 
          you agree to be bound by these terms.
        </p>
        <p className="text-sm text-gray-500 mt-4">Last Updated: January 2024</p>
      </section>

      {/* Quick Summary */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 rounded-2xl border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Quick Summary
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>You must be at least 13 years old to use PingMe</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Use the service responsibly and respect other users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Don't share illegal content or spam other users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>We can terminate accounts that violate these terms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>The service is provided "as is" without warranties</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Detailed Terms */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By creating an account or using PingMe, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions, as well as our Privacy Policy. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">2. Eligibility</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You must be at least 13 years old to use PingMe. If you are under 18, you must have 
              permission from a parent or guardian. By using our service, you represent and warrant 
              that you meet these age requirements.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Users under 13 years of age are strictly prohibited from creating accounts or using 
              the service in any capacity.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">3. Account Responsibilities</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">Account Security:</span> You are responsible 
                for maintaining the security of your account and password. PingMe cannot and will not be 
                liable for any loss or damage from your failure to comply with this security obligation.
              </p>
              <p>
                <span className="font-semibold text-white">Accurate Information:</span> You agree to 
                provide accurate, current, and complete information during registration and to update 
                such information to keep it accurate, current, and complete.
              </p>
              <p>
                <span className="font-semibold text-white">Account Actions:</span> You are responsible 
                for all activities that occur under your account, whether or not you authorized such activities.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">4. Acceptable Use Policy</h2>
            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-6 space-y-3">
              <p className="text-gray-300 font-semibold mb-3">You agree NOT to use PingMe to:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Share illegal, harmful, threatening, abusive, or defamatory content</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Harass, stalk, or harm another person or group</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Impersonate any person or entity or misrepresent your affiliation</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Distribute spam, chain letters, or promote pyramid schemes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Upload viruses, malware, or any malicious code</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Attempt to gain unauthorized access to our systems or other users' accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Use automated systems or bots without our express permission</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">5. Content and Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              <span className="font-semibold text-white">Your Content:</span> You retain all rights to 
              the content you create and share on PingMe. By posting content, you grant us a license to 
              store, display, and transmit your content as necessary to provide the service.
            </p>
            <p className="text-gray-300 leading-relaxed">
              <span className="font-semibold text-white">Our Content:</span> PingMe and its original 
              content, features, and functionality are owned by PingMe Inc. and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">6. Termination</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We reserve the right to terminate or suspend your account immediately, without prior notice 
              or liability, for any reason, including but not limited to breach of these Terms.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Upon termination, your right to use the service will immediately cease. All provisions of 
              these Terms which by their nature should survive termination shall survive, including 
              ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">7. Disclaimers and Limitations</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">Service "As Is":</span> PingMe is provided 
                "as is" and "as available" without warranties of any kind, either express or implied. 
                We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
              <p>
                <span className="font-semibold text-white">Limitation of Liability:</span> To the maximum 
                extent permitted by law, PingMe shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">8. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through the service. Your continued use of PingMe after such modifications 
              constitutes your acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">9. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:legal@pingme.app" className="text-purple-400 hover:text-purple-300 underline">
                legal@pingme.app
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Agreement Section */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[#0f172a] border border-purple-500/50 rounded-xl p-8 text-center">
          <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-3">By Using PingMe</h3>
          <p className="text-gray-300">
            You acknowledge that you have read these Terms and Conditions and agree to be bound by them. 
            If you do not agree to these terms, please discontinue use of our service immediately.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-gray-800 flex items-center">
        <div className="w-full px-6 flex justify-between text-sm text-gray-500">
          
          {/* Left */}
          <div className="flex items-center gap-2 text-gray-400">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <span className="font-medium">PingMe</span>
          </div>

          {/* Right */}
          <p className="text-sm text-gray-500">
            © 2026 PingMe · All rights reserved
          </p>

        </div>
      </footer>
    </div>
  );
}