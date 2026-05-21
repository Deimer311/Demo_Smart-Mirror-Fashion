'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Share2, Info, Camera, CameraOff, Sparkles, Loader2 } from 'lucide-react';
import { useMirrorStore, Garment } from '@/store/useMirrorStore';
import { usePoseSmoother } from '@/hooks/usePoseSmoother';
import { renderWarpedGarment } from '@/utils/canvasWarp';
import Script from 'next/script';

declare global {
  interface Window {
    poseDetection: any;
    tf: any;
  }
}

const garments: Garment[] = [
  { id: '1', name: 'Chaqueta Urban Noir', type: 'top', image: '/garments/top-1.svg', color: 'bg-zinc-800', price: '$89.00' },
  { id: '2', name: 'Vestido Rose Silk', type: 'full', image: '/garments/full-1.svg', color: 'bg-rose-200', price: '$120.00' },
  { id: '3', name: 'Camisa Ocean Breeze', type: 'top', image: '/garments/top-2.svg', color: 'bg-blue-300', price: '$45.00' },
];

const MirrorDemo = () => {
  const { 
    isCameraActive, setCameraActive, 
    isModelLoading, setModelLoading,
    selectedGarment, setSelectedGarment,
    setPoseLandmarks 
  } = useMirrorStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const detectorRef = useRef<any>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize Pose Smoother (One Euro Filter)
  const { smoothPose, resetFilters } = usePoseSmoother();

  // Load garment image when selected
  useEffect(() => {
    if (selectedGarment) {
      const img = new Image();
      img.src = selectedGarment.image;
      img.onload = () => {
        garmentImgRef.current = img;
      };
      img.onerror = () => {
        console.error('Failed to load garment image:', selectedGarment.image);
        garmentImgRef.current = null;
      };
    } else {
      garmentImgRef.current = null;
    }
  }, [selectedGarment]);

  // Initialize AI Model from CDN
  const initModel = async () => {
    if (typeof window === 'undefined' || !window.poseDetection) return;
    
    try {
      setModelLoading(true);
      await window.tf.ready();
      
      const model = window.poseDetection.SupportedModels.MoveNet;
      detectorRef.current = await window.poseDetection.createDetector(model, {
        modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
      });
      console.log('AI Detector initialized from CDN');
    } catch (error) {
      console.error('Error initializing AI model:', error);
    } finally {
      setModelLoading(false);
    }
  };

  // Handle Detection Loop
  const detect = useCallback(async () => {
    if (videoRef.current && videoRef.current.readyState === 4 && detectorRef.current) {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      
      if (poses.length > 0) {
        const rawLandmarks = poses[0].keypoints;
        const smoothed = smoothPose(rawLandmarks);
        setPoseLandmarks(smoothed);
        drawPose(smoothed);
      } else {
        clearCanvas();
      }
    }
    requestRef.current = requestAnimationFrame(detect);
  }, [setPoseLandmarks, smoothPose]);

  useEffect(() => {
    if (isCameraActive) {
      requestRef.current = requestAnimationFrame(detect);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearCanvas();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive, detect]);

  // Canvas Drawing
  const drawPose = (keypoints: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Skeleton (Debugging)
    // drawSkeleton(ctx, keypoints);

    // 2. Draw Virtual Garment
    if (selectedGarment) {
      drawGarment(ctx, keypoints, selectedGarment);
    }
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, keypoints: any[]) => {
    ctx.fillStyle = '#ff0080';
    keypoints.forEach((kp) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawGarment = (ctx: CanvasRenderingContext2D, keypoints: any[], garment: Garment) => {
    if (garmentImgRef.current && garmentImgRef.current.complete) {
      renderWarpedGarment(ctx, garmentImgRef.current, garment.type, keypoints);
    } else {
      // Fallback block drawing if image is not yet loaded
      const ls = keypoints[5];
      const rs = keypoints[6];
      if (!ls || !rs || ls.score < 0.3 || rs.score < 0.3) return;

      const centerX = (ls.x + rs.x) / 2;
      const centerY = (ls.y + rs.y) / 2;
      const shoulderWidth = Math.sqrt(Math.pow(rs.x - ls.x, 2) + Math.pow(rs.y - ls.y, 2));
      const scale = shoulderWidth * 2.5;
      const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x);

      ctx.save();
      ctx.translate(centerX, centerY + (garment.type === 'top' ? shoulderWidth * 0.5 : 0));
      ctx.rotate(angle);
      ctx.fillStyle = garment.color === 'bg-zinc-800' ? '#18181b' : 
                     garment.color === 'bg-rose-200' ? '#fecdd3' : '#93c5fd';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(-scale/2, 0, scale, garment.type === 'top' ? scale * 1.2 : scale * 2);
      ctx.restore();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveOutfit = async () => {
    if (!selectedGarment) return;
    
    try {
      const response = await fetch('http://localhost:5050/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `My Outfit ${new Date().toLocaleDateString()}`,
          items: [selectedGarment]
        })
      });
      
      if (response.ok) {
        alert('¡Outfit guardado correctamente!');
      }
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  // Handle Camera Toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      resetFilters();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('No se pudo acceder a la cámara. Por favor verifica los permisos.');
      }
    }
  };

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection" 
        strategy="afterInteractive"
        onReady={() => { initModel(); }}
      />
      
      <section id="demo" className="py-24 overflow-hidden bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Controls Panel */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full border border-gray-700 mb-6"
            >
              <span className="text-xs font-semibold tracking-widest uppercase">Smart Mirror AI v1.0</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Tu probador virtual, <br />
              <span className="text-gray-500">en tiempo real.</span>
            </h2>
            
            <div className="mb-10 flex gap-4">
              <button
                onClick={toggleCamera}
                disabled={isModelLoading}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                  isCameraActive 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                  : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isCameraActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                {isCameraActive ? 'Apagar Espejo' : 'Encender Espejo'}
              </button>
              
              {isModelLoading && (
                <div className="flex items-center gap-2 text-muted animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando IA...
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {garments.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedGarment(item)}
                  className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all border ${
                    selectedGarment?.id === item.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.color}`} />
                    <div className="text-left">
                      <div className="font-bold text-sm">{item.name}</div>
                      <div className={`text-xs ${selectedGarment?.id === item.id ? 'text-gray-500' : 'text-zinc-500'}`}>
                        {item.price}
                      </div>
                    </div>
                  </div>
                  <RefreshCw className={`w-4 h-4 ${selectedGarment?.id === item.id ? 'text-primary' : 'text-zinc-600'}`} />
                </button>
              ))}
            </div>
            
            <button
              onClick={saveOutfit}
              disabled={!selectedGarment}
              className="w-full mt-8 py-4 bg-primary text-background rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              Guardar Outfit Completo
            </button>
          </div>
          
          {/* Mirror Viewport */}
          <div className="lg:w-1/2 w-full flex justify-center">
            <div className="relative aspect-[3/4] w-full max-w-[450px]">
              <div className="absolute inset-0 bg-zinc-900 rounded-[3rem] border-[12px] border-zinc-800 shadow-2xl overflow-hidden bg-black">
                
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${isCameraActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                />
                
                {/* AI Overlay Canvas */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-20"
                />

                {/* Empty State / Standby */}
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                      <MirrorIcon className="w-10 h-10 text-zinc-500" />
                    </div>
                    <p className="text-zinc-500 font-medium">Activa tu cámara para empezar la prueba virtual</p>
                  </div>
                )}

                {/* Mirror Interface Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-30 pointer-events-none">
                  <div className="flex justify-between items-start">
                    {isCameraActive && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">AI Scanning Active</span>
                      </motion.div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 pointer-events-auto">
                      <Info className="w-5 h-5 text-white/60" />
                    </div>
                  </div>
                  
                  {selectedGarment && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-black/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 pointer-events-auto"
                    >
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <div className="text-xs text-white/60 mb-1">Prenda Seleccionada</div>
                          <div className="text-xl font-bold">{selectedGarment.name}</div>
                        </div>
                        <div className="text-2xl font-bold">{selectedGarment.price}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
                          Comprar ahora
                        </button>
                        <button className="w-14 py-4 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Decorative glows */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-accent-blue rounded-full blur-3xl opacity-10" />
              <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-accent-pink rounded-full blur-3xl opacity-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

const MirrorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path d="M12 4v.01" />
    <path d="M17.66 6.34v.01" />
    <path d="M20 12h.01" />
    <path d="M17.66 17.66v.01" />
    <path d="M12 20v.01" />
    <path d="M6.34 17.66v.01" />
    <path d="M4 12h.01" />
    <path d="M6.34 6.34v.01" />
  </svg>
);

export default MirrorDemo;
;
