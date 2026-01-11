import React from 'react';

const PrivacyPolicy = ({ onBack, darkMode }) => {
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  
  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className={`max-w-4xl mx-auto ${cardClass} rounded-2xl shadow-lg p-8`}>
        <button onClick={onBack} className="text-blue-500 mb-4 hover:underline">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us when you create an account, 
          including your name, email address, and pantry inventory data.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Send you expiry notifications and updates</li>
          <li>Respond to your comments and questions</li>
          <li>Generate AI-powered meal suggestions</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">3. Data Storage</h2>
        <p className="mb-4">
          Your data is stored securely using Firebase/Google Cloud Platform with industry-standard encryption.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">4. Your Rights (GDPR)</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">5. Contact Us</h2>
        <p className="mb-4">For privacy questions, contact: privacy@pantryapp.com</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
