import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Loader2, AlertCircle } from 'lucide-react';

export default function FaceScanner({ onEmotionDetected }) {
  const videoRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load the AI Models from our public folder
    useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        // ⏱️ START THE STOPWATCH
        console.time("ModelLoadTime"); 

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        // 🛑 STOP THE STOPWATCH AND PRINT TO CONSOLE
        console.timeEnd("ModelLoadTime"); 

        setIsModelsLoaded(true);
      } catch (err) {
        setError("Failed to load AI models. Did you put them in the public folder?");
        console.error(err);
      }
    };
    loadModels();
  }, []);

  // 2. Start the Webcam
  const startVideo = () => {
    setIsScanning(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        let video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((err) => {
        setError("Please allow webcam access to use the scanner.");
        setIsScanning(false);
      });
  };

  // 3. Scan the face when the video starts playing
  const handleVideoPlaying = () => {
    // We run the detection every 1 second (1000ms)
    const scanInterval = setInterval(async () => {
      const startTime = performance.now(); // ⏱️ Note the exact millisecond
      if (!videoRef.current) return;

      const detections = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceExpressions();

      const endTime = performance.now(); // 🛑 Note the exact millisecond it finished
  
  console.log(`Frame processed in: ${endTime - startTime} milliseconds`);

      if (detections) {
        // Find the strongest emotion
        const expressions = detections.expressions;
        const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        
        // If we are highly confident (over 60%), trigger the result and stop!
        if (expressions[dominantEmotion] > 0.6) {
          clearInterval(scanInterval);
          stopVideo();
          onEmotionDetected(dominantEmotion); // Send the emotion back to the Dashboard
        }
      }
    }, 1000);
  };

  const stopVideo = () => {
    setIsScanning(false);
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach(track => track.stop());
  };

  // Clean up the camera if the user leaves the page
  useEffect(() => {
    return () => stopVideo();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black/60 border border-gray-800 rounded-lg max-w-2xl mx-auto">
      
      {error && (
        <div className="flex items-center gap-2 text-netflix-red mb-4 p-3 bg-red-900/20 rounded">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded overflow-hidden border border-gray-700 flex items-center justify-center shadow-2xl shadow-netflix-red/10">
        <video 
          ref={videoRef} 
          onPlay={handleVideoPlaying}
          className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`}
          muted
        />
        
        {!isScanning && (
          <div className="absolute flex flex-col items-center text-gray-500">
            <Camera size={48} className="mb-2 opacity-50" />
            <p>Camera is currently off</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 text-center">
        {!isModelsLoaded ? (
          <button disabled className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-400 font-bold rounded cursor-not-allowed">
            <Loader2 className="animate-spin" size={20} />
            Loading AI Engine...
          </button>
        ) : !isScanning ? (
          <button 
            onClick={startVideo}
            className="px-8 py-3 bg-netflix-red text-white font-bold rounded hover:bg-red-700 transition shadow-lg shadow-netflix-red/30"
          >
            Start Face Scan
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-netflix-red animate-pulse font-bold tracking-widest">
               <div className="w-2 h-2 bg-netflix-red rounded-full"></div>
               ANALYZING EMOTION...
             </div>
             <p className="text-sm text-gray-400">Please look straight into the camera</p>
          </div>
        )}
      </div>

    </div>
  );
}