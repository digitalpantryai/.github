import React from 'react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <button onClick={onBack} className="text-blue-500 mb-4">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us when you create an account, 
          including your name, email address, and pantry inventory data.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Send you expiry notifications and updates</li>
          <li>Respond to your comments and questions</li>
          <li>Generate AI-powered meal suggestions based on your pantry</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">3. Data Storage</h2>
        <p className="mb-4">
          Your data is stored securely using Firebase/Google Cloud Platform. 
          We use industry-standard encryption to protect your information.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">4. Your Rights (GDPR)</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">5. Cookies</h2>
        <p className="mb-4">
          We use essential cookies to maintain your session and preferences. 
          No tracking or advertising cookies are used.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">6. Third-Party Services</h2>
        <p className="mb-4">
          We use:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Anthropic Claude API for AI meal suggestions</li>
          <li>Open Food Facts for barcode product data</li>
          <li>Stripe for payment processing (if applicable)</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">7. Contact Us</h2>
        <p className="mb-4">
          For privacy questions, contact us at: privacy@yourpantryapp.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
