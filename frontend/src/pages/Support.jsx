import { MessageCircle, Mail, MessageSquare, Book, HelpCircle, Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from "react-router-dom";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Download PingMe from your app store, open the app, and follow the registration process using your facebook or email address."
    },
    {
      question: "Is PingMe really end-to-end encrypted?",
      answer: "Yes! All your messages are encrypted on your device before being sent, and only the recipient can decrypt them. We cannot read your messages."
    },
    {
      question: "Can I use PingMe on multiple devices?",
      answer: "Absolutely! PingMe syncs across all your devices. Just sign in with the same account on your phone, tablet, or desktop."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings > Account > Delete Account. Please note this action is permanent and cannot be undone."
    },
    {
      question: "What should I do if I forgot my password?",
      answer: "Click 'Forgot Password' on the login screen and follow the instructions sent to your registered email or phone number."
    }
  ];

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
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          How Can We Help You?
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Find answers to common questions or get in touch with our support team
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </section>

      {/* Contact Options */}
        <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Get In Touch</h2>

        <div className="grid md:grid-cols-3 gap-6">
            
            {/* Email */}
            <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-all text-center">
            <Mail className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Email Support</h3>
            <p className="text-gray-400 mb-4">
                Get help via email within 24 hours
            </p>
            <a
                href="mailto:support@pingme.app"
                className="text-purple-400 hover:text-purple-300 font-medium"
            >
                support@pingme.app
            </a>
            </div>

            {/* Report Issue */}
            <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-all text-center">
            <MessageSquare className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Report a Problem</h3>
            <p className="text-gray-400 mb-4">
                Found a bug or something not working?
            </p>
            <a
                href="mailto:support@pingme.app"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
            >
                Report Issue
            </a>
            </div>

            {/* Docs */}
            <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-all text-center">
            <Book className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Help & Policies</h3>
            <p className="text-gray-400 mb-4">
                Learn more about PingMe!
            </p>

            <div className="flex justify-center gap-4 text-sm font-medium">
                <Link to="/about" className="text-purple-400 hover:text-purple-300">
                About
                </Link>
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                Privacy
                </Link>
                <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                Terms
                </Link>
            </div>
            </div>

        </div>
        </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details 
              key={index}
              className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-colors"
            >
              <summary className="px-6 py-4 cursor-pointer font-semibold text-lg hover:text-purple-400 transition-colors">
                {faq.question}
              </summary>
              <div className="px-6 pb-4 text-gray-400 border-t border-gray-800 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Additional Help */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 rounded-2xl border border-purple-500/30 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is available 24/7 to assist you with any issues or questions you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@pingme.app"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Contact Support
            </a>
            <a
                href="mailto:feedback@pingme.app?subject=PingMe Feedback / Bug Report"
                className="bg-transparent border border-purple-500 hover:bg-purple-500/10 
                            text-purple-400 px-8 py-3 rounded-lg font-medium transition-colors inline-block"
                >
                Send Feedback
            </a>
          </div>
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