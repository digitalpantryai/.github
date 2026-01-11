import React from 'react';

const Terms = ({ onBack, darkMode }) => {
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  
  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className={`max-w-4xl mx-auto ${cardClass} rounded-2xl shadow-lg p-8`}>
        <button onClick={onBack} className="text-blue-500 mb-4 hover:underline">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Pantry, you accept and agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">2. User Accounts</h2>
        <p className="mb-4">You are responsible for:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Maintaining the confidentiality of your account</li>
          <li>All activities under your account</li>
          <li>Notifying us of unauthorized access</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">3. Prohibited Uses</h2>
        <p className="mb-4">You may not:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Use the service for illegal purposes</li>
          <li>Attempt to gain unauthorized access</li>
          <li>Interfere with the service's operation</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">4. Disclaimer</h2>
        <p className="mb-4">
          Pantry is provided "as is" without warranties. We are not responsible for food safety 
          decisions based on expiry dates or AI-generated meal suggestions.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">5. Contact</h2>
        <p className="mb-4">Questions? Email: support@pantryapp.com</p>
      </div>
    </div>
  );
};

export default Terms;
