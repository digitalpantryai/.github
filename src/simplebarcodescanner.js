import React, { useRef, useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

const SimpleBarcodeScanner = ({ onScan, onClose, darkMode }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [manualEntry, setManualEntry] = useState('');

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Cannot access camera. Please check permissions.');
    }
  };

  const handleManualSubmit = () => {
    if (manualEntry.trim()) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onScan(manualEntry.trim());
    }
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200';

  return (
    <div className={`fixed inset-0 ${bgClass} z-50 flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${textClass}`}>Scan Barcode</h2>
        <button 
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            onClose();
          }} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X size={24} className={textClass} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="text-center max-w-md">
            <Camera className="mx-auto mb-4 text-red-500" size={64} />
            <p className="text-red-500 mb-6">{error}</p>
            <div className="space-y-4">
              <p className={textClass}>Enter barcode manually:</p>
              <input
                type="text"
                placeholder="Type barcode number"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              <button
                onClick={handleManualSubmit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
              >
                Lookup Product
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl shadow-2xl"
            />
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${mutedClass} mb-3`}>Can't scan? Enter barcode manually:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Barcode number"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className={`flex-1 p-3 border rounded-xl ${inputClass}`}
                />
                <button
                  onClick={handleManualSubmit}
                  className="px-5 py-3 bg-blue-500 text-white rounded-xl font-medium"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-xs ${mutedClass} text-center`}>
          📱 Point camera at barcode • Allow camera access when prompted • Or enter manually above
        </p>
      </div>
    </div>
  );
};

export default SimpleBarcodeScanner;
