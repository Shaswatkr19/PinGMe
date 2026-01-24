import { MessageCircle, Shield, Zap, Users, Lock, Globe } from 'lucide-react';

export default function About() {
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
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          About PingMe
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          PingMe is a modern chat platform designed for people who value speed, privacy, 
          and meaningful connections. We're building the future of instant messaging.
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-colors">
            <Zap className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed">
              Experience real-time messaging with near-zero latency. Your messages 
              reach instantly, no matter where you are in the world.
            </p>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-colors">
            <Shield className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Privacy First</h3>
            <p className="text-gray-400 leading-relaxed">
              End-to-end encryption ensures your conversations stay private. 
              We never read, store, or share your personal messages.
            </p>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-purple-500 transition-colors">
            <Users className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Connect Anywhere</h3>
            <p className="text-gray-400 leading-relaxed">
              Stay connected across all your devices. Seamlessly sync your chats 
              from mobile to desktop and everywhere in between.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-12 rounded-2xl border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            In a world where digital communication is essential, we believe privacy 
            shouldn't be a luxury. PingMe was created to give people a secure, 
            fast, and intuitive platform for staying connected with the people who matter most.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            We're committed to building technology that respects your privacy, 
            protects your data, and empowers genuine human connection without compromise.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">10M+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">150+</div>
            <div className="text-gray-400">Countries</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">5B+</div>
            <div className="text-gray-400">Messages Daily</div>
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