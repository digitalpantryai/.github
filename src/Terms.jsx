import React from 'react';

const Terms = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <button onClick={onBack} className="text-blue-500 mb-4">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Pantry, you accept and agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">2. Use License</h2>
        <p className="mb-4">
          We grant you a personal, non-transferable license to use Pantry for managing your household inventory.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">3. User Accounts</h2>
        <p className="mb-4">
          You are responsible for:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Maintaining the confidentiality of your account</li>
          <li>All activities under your account</li>
          <li>Notifying us of unauthorized access</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">4. Prohibited Uses</h2>
        <p className="mb-4">
          You may not:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Use the service for illegal purposes</li>
          <li>Attempt to gain unauthorized access</li>
          <li>Interfere with the service's operation</li>
          <li>Upload malicious code or content</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">5. Subscription & Payment</h2>
        <p className="mb-4">
          Paid subscriptions are billed monthly or annually. You may cancel anytime. 
          No refunds for partial months.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">6. Disclaimer</h2>
        <p className="mb-4">
          Pantry is provided "as is" without warranties. We are not responsible for:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Food safety decisions based on expiry dates</li>
          <li>Accuracy of barcode product information</li>
          <li>AI-generated meal suggestions</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">7. Limitation of Liability</h2>
        <p className="mb-4">
          We are not liable for any damages arising from use of this service, 
          including food poisoning or allergic reactions.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">8. Changes to Terms</h2>
        <p className="mb-4">
          We may update these terms. Continued use after changes constitutes acceptance.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">9. Contact</h2>
        <p className="mb-4">
          Questions? Email: support@yourpantryapp.com
        </p>
      </div>
    </div>
  );
};

export default Terms;
