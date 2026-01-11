import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose, darkMode }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // Prefer back camera on mobile
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCamera(backCamera.id);
      } else {
        setError('No cameras found');
      }
    }).catch(err => {
      console.error('Camera error:', err);
      setError('Cannot access camera. Please allow camera permissions.');
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error('Stop error:', err));
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) return;

    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 100 }
        },
        (decodedText) => {
          // Successfully scanned
          html5QrCode.stop();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Scanning (not an error, just no barcode detected yet)
        }
      );

      setScanning(true);
      setError('');
    } catch (err) {
      console.error('Scan start error:', err);
      setError('Failed to start camera: ' + err.message);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
      }).catch(err => {
        console.error('Stop error:', err);
      });
    }
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`fixed inset-0 ${bgClass} z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${textClass}`}>Scan Barcode</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <X size={24} className={textClass} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="text-center">
            <Camera className="mx-auto mb-4 text-red-500" size={64} />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl"
            >
              Reload & Try Again
            </button>
          </div>
        ) : !scanning ? (
          <div className="text-center">
            <Camera className={`mx-auto mb-4 ${mutedClass}`} size={64} />
            <p className={`${mutedClass} mb-4`}>Position barcode in the frame</p>
            {cameras.length > 1 && (
              <select
                value={selectedCamera || ''}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="mb-4 p-3 border rounded-xl"
              >
                {cameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={startScanning}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold text-lg"
            >
              Start Camera
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div id="barcode-reader" className="rounded-xl overflow-hidden shadow-2xl"></div>
            <p className={`text-center mt-4 ${mutedClass}`}>Scanning... Point camera at barcode</p>
            <button
              onClick={stopScanning}
              className="w-full mt-4 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold"
            >
              Stop Scanning
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <p className={`text-sm ${mutedClass} text-center`}>
          📱 Works best with good lighting • Hold steady • Barcodes must be clear and in focus
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
