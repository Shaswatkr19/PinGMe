import { MessageCircle, Shield, Zap, Users, ArrowLeft, Linkedin, Github, Mail, X  } from 'lucide-react';
import { useState } from 'react';
import founderPhoto from "../assets/founder-photo.jpg";

export default function About() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 flex flex-col">
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
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl font-bold mb-6 text-purple-400">
          About PingMe
        </h1>

        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          PingMe is a modern chat platform designed for people who value speed,
          privacy, and meaningful connections. We're building the future of instant messaging.
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
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

      {/* Founder Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Meet the Founder</h2>
          <p className="text-gray-400">The vision behind PingMe</p>
        </div>

        <div className="max-w-3xl mx-auto bg-[#0f172a] p-8 md:p-12 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
              >
                <img
                  src={founderPhoto}
                  alt="Shaswat Kumar"
                  className="w-full h-full object-cover object-top scale-[1.05]"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Shaswat Kumar</h3>
              <p className="text-purple-400 font-medium mb-4">Founder</p>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                I'm a growing Full Stack Developer who loves learning, building, and improving 
                every day. I focus on creating practical, user friendly web solutions while 
                constantly sharpening my skills with modern technologies.
              </p>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-6">
                <a
                  href="mailto:shaswatkr19@gmail.com"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">shaswatsinha356@gmail.com</span>
                </a>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href="https://www.linkedin.com/in/shaswatkr19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://github.com/Shaswatkr19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Modal */}
      {showAvatarModal && (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm 
                  flex items-center justify-center z-50 p-4"
      >
        <div className="relative">

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setShowAvatarModal(false)}
            className="absolute -top-4 -right-4 z-50
                      bg-black/70 hover:bg-black
                      text-white rounded-full p-2
                      shadow-lg transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* IMAGE */}
          <img
            src={founderPhoto}
            alt="Shaswat Kumar"
            className="max-w-[70vw] max-h-[60vh] 
                      object-contain rounded-xl
                      mx-auto border border-purple-500/40"
          />
        </div>
      </div>
    )}


      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-10 md:p-14 text-center rounded-2xl border border-purple-500/30">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
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