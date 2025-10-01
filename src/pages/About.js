import React from "react";

export default function About() {
  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-900">
      <h1 className="text-4xl font-bold text-green-700 mb-6">
        About PCE Shopping Mall
      </h1>

      <p className="text-lg mb-6 leading-relaxed">
        <strong>PCE Shopping Mall</strong>, proudly operated by{" "}
        <strong>Paul Chuk Enterprise</strong>, is a vibrant retail destination 
        located at <em>Peace Line, Goroddom, Idumota, Lagos Island, Eko</em>. 
        We are dedicated to providing a modern, enjoyable, and reliable shopping 
        experience for visitors of all ages.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">✨ Key Features</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Wide Range of Stores:</strong> Fashion boutiques, electronics, home décor, and specialty shops.</li>
        <li><strong>Dining Options:</strong> Food court, restaurants, and cafés with quick bites and fine dining.</li>
        <li><strong>Entertainment:</strong> A modern cinema, family-friendly arcade, and live performances in our central atrium.</li>
        <li><strong>Convenience:</strong> Parking, free Wi-Fi, kids’ play area, and accessible facilities for everyone.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">💡 Our Core Values</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>✅ Well-Organized – Smooth, structured shopping experience.</li>
        <li>✅ Trustworthy – Integrity and transparency always.</li>
        <li>✅ Reliable – Consistent quality and customer satisfaction.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">👔 Leadership</h2>
      <p className="text-lg mb-6 leading-relaxed">
        PCE Shopping Mall is led by <strong>Paul Chuk Enterprise</strong>, 
        our visionary CEO. With a passion for innovation and growth, he proudly says: 
        <em>“Wow, I can’t believe I’m gonna be a CEO soon.”</em>
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">🎯 Our Mission</h2>
      <p className="text-lg mb-6 leading-relaxed">
        To provide a world-class shopping experience that combines convenience, 
        variety, and trust, while creating value for our customers, employees, 
        and community.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">🌍 Our Vision</h2>
      <p className="text-lg leading-relaxed">
        To become the most trusted and innovative shopping mall in Lagos and beyond, 
        representing growth, reliability, and excellence.
      </p>

      {/* WhatsApp Contact Button */}
      <div className="mt-12 flex justify-center">
        <a
          href="https://wa.me/2347089724573"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition duration-300"
        >
          💬 Chat with Us on WhatsApp
        </a>
      </div>
    </div>
  );
          }
