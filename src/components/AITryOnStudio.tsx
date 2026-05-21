'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, ArrowRight, Sparkles, Plus, RefreshCw, 
  User, Image as ImageIcon, Send, Loader2, Check, Download, ShoppingCart 
} from 'lucide-react';
import { useMirrorStore } from '@/store/useMirrorStore';
import { ImageSlider } from './ImageSlider';
import { generateAITryOn } from '@/services/aiTryOn';

const presetGarments = [
  { id: 'p1', name: 'Chaqueta Urban Noir', type: 'top', image: '/garments/top-1.svg', color: 'bg-zinc-800' },
  { id: 'p2', name: 'Vestido Rose Silk', type: 'full', image: '/garments/full-1.svg', color: 'bg-rose-200' },
  { id: 'p3', name: 'Camisa Ocean Breeze', type: 'top', image: '/garments/top-2.svg', color: 'bg-blue-300' },
];

export const AITryOnStudio = () => {
  const {
    personImage, setPersonImage,
    garmentImage, setGarmentImage,
    tryOnResult, setTryOnResult,
    tryOnStatus, setTryOnStatus,
    tryOnProgress, setTryOnProgress,
    tryOnMessages, addTryOnMessage,
    clearTryOnStudio
  } = useMirrorStore();

  const [chatInput, setChatInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [detector, setDetector] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tryOnMessages]);

  // Load MoveNet detector for local pose estimation on upload
  useEffect(() => {
    const loadModel = async () => {
      if (typeof window === 'undefined') return;
      if (window.poseDetection && window.tf) {
        try {
          setIsModelLoading(true);
          await window.tf.ready();
          const model = window.poseDetection.SupportedModels.MoveNet;
          const det = await window.poseDetection.createDetector(model, {
            modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
          });
          setDetector(det);
        } catch (err) {
          console.error('Error loading detector inside Try-On Studio:', err);
        } finally {
          setIsModelLoading(false);
        }
      }
    };
    
    // Check after a short delay to allow CDN scripts in MirrorDemo to load
    const timer = setTimeout(loadModel, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Person Photo Upload
  const handlePersonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPersonImage(event.target.result as string);
        addTryOnMessage({
          sender: 'assistant',
          text: 'Perfecto, he recibido tu foto. Ahora sube una prenda de tu galería o selecciona uno de nuestros diseños preestablecidos abajo para empezar la prueba virtual.'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Garment Photo Upload
  const handleGarmentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPreset(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setGarmentImage(event.target.result as string);
        addTryOnMessage({
          sender: 'assistant',
          text: '¡Entendido! Tengo la prenda cargada. Cuando estés listo, presiona "Generar Outfit con IA" para ver el resultado.'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Selection
  const handlePresetSelect = (preset: typeof presetGarments[0]) => {
    setSelectedPreset(preset.id);
    setGarmentImage(preset.image);
    addTryOnMessage({
      sender: 'assistant',
      text: `Has seleccionado: ${preset.name}. Todo listo para fusionarlo con tu foto.`
    });
  };

  // Run Virtual Try-On Generation
  const handleGenerate = async () => {
    if (!personImage || !garmentImage) return;

    setTryOnStatus('analyzing');
    setTryOnProgress(10);
    
    addTryOnMessage({
      sender: 'user',
      text: 'Generar Outfit'
    });

    // Simulate progress updates for UI states
    const statusSteps = [
      { status: 'analyzing' as const, progress: 25, text: 'Analizando silueta y proporciones corporales...' },
      { status: 'warping' as const, progress: 55, text: 'Deformando y adaptando tejido al contorno del cuerpo...' },
      { status: 'generating' as const, progress: 85, text: 'Fusionando iluminación, sombras y texturas con IA...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < statusSteps.length) {
        const step = statusSteps[currentStep];
        setTryOnStatus(step.status);
        setTryOnProgress(step.progress);
        addTryOnMessage({
          sender: 'assistant',
          text: step.text
        });
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1800);

    try {
      // Determine type based on selection
      let type: 'top' | 'full' = 'top';
      const presetObj = presetGarments.find(p => p.id === selectedPreset);
      if (presetObj) {
        type = presetObj.type as 'top' | 'full';
      }

      // Execute Try-on pipeline
      const resultImage = await generateAITryOn(
        personImage,
        garmentImage,
        type,
        detector,
        (progress) => {
          // Adjust base progress to align with UI animation steps
          if (progress > 85) setTryOnProgress(progress);
        }
      );

      // Finish generation
      clearInterval(interval);
      setTryOnProgress(100);
      setTryOnStatus('success');
      setTryOnResult(resultImage);

      addTryOnMessage({
        sender: 'assistant',
        text: '¡Listo! He fusionado la prenda con tu foto respetando la pose, sombras e iluminación natural. Mira el resultado en el comparador de la derecha.',
        image: resultImage
      });

    } catch (error) {
      clearInterval(interval);
      setTryOnStatus('error');
      console.error(error);
      addTryOnMessage({
        sender: 'assistant',
        text: 'Hubo un error al generar la prenda con la Inteligencia Artificial. Por favor intenta con otra foto o vuelve a subir los archivos.'
      });
    }
  };

  // Handle Visual Chat Text Submit
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    addTryOnMessage({
      sender: 'user',
      text: userText
    });
    setChatInput('');

    // Simulate smart assistant responses based on keywords
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let response = '';

      if (lower.includes('chaqueta') || lower.includes('noir') || lower.includes('cuero')) {
        response = 'La chaqueta de cuero Urban Noir es perfecta para un estilo urbano y sofisticado. He seleccionado la prenda de nuestro catálogo por ti. ¿Quieres probarla ahora?';
        handlePresetSelect(presetGarments[0]);
      } else if (lower.includes('vestido') || lower.includes('rose') || lower.includes('seda')) {
        response = 'El vestido Rose Silk tiene un drapeado elegante ideal para eventos especiales. He cargado la prenda en el visualizador. ¿Probamos?';
        handlePresetSelect(presetGarments[1]);
      } else if (lower.includes('camisa') || lower.includes('azul') || lower.includes('lino')) {
        response = 'La camisa Ocean Breeze de lino azul es fresca y casual. Acabo de seleccionarla. ¿Quieres ver cómo te queda?';
        handlePresetSelect(presetGarments[2]);
      } else if (lower.includes('combinar') || lower.includes('sugerencia') || lower.includes('pantalon')) {
        response = 'Para combinar estas prendas de arriba, te recomiendo pantalones de gabardina claros o vaqueros slim oscuros para mantener un balance casual premium. ¿Qué opinas?';
      } else if (!personImage) {
        response = 'Para poder darte recomendaciones y hacer un Try-On virtual exacto, por favor sube una foto de tu cuerpo en la sección de la derecha primero.';
      } else {
        response = '¡Entendido! Puedo ayudarte a ajustar este diseño, cambiar colores o darte tips de moda. Recuerda presionar "Generar Outfit con IA" para aplicar los cambios a tu foto.';
      }

      addTryOnMessage({
        sender: 'assistant',
        text: response
      });
    }, 1000);
  };

  return (
    <section id="tryon-studio" className="py-24 bg-zinc-950 text-white overflow-hidden relative border-t border-zinc-900">
      {/* Background radial glows */}
      <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-accent-blue rounded-full blur-[130px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-accent-pink rounded-full blur-[130px] opacity-10 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI Try-On Studio</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Pruébate cualquier prenda <br />
            <span className="gradient-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">con Inteligencia Artificial.</span>
          </h2>
          
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Sube tu foto y la prenda que quieras, o pídele a nuestro asistente virtual de moda que cree una combinación perfecta para ti.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Assistant Chat Area */}
          <div className="lg:col-span-5 flex flex-col h-[600px] glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl bg-zinc-900/40">
            <div className="p-6 border-b border-white/5 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Asistente AI de Moda</h3>
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    Online & Analizando
                  </span>
                </div>
              </div>
              <button 
                onClick={clearTryOnStudio}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                title="Reiniciar Estudio"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {tryOnMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' 
                    ? 'bg-zinc-800 border border-zinc-700 text-white' 
                    : 'bg-purple-950 border border-purple-800 text-purple-300'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-md ${
                      msg.sender === 'user'
                      ? 'bg-white text-black rounded-tr-none'
                      : 'bg-zinc-900/90 text-zinc-300 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden border border-white/10 max-w-[200px] shadow-lg">
                        <img src={msg.image} alt="Result preview" className="w-full h-auto" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets Slider Panel inside Chat */}
            <div className="px-6 py-3 border-t border-white/5 bg-zinc-900/20">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">Prendas recomendadas</div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {presetGarments.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl shrink-0 transition-all text-xs font-semibold border ${
                      selectedPreset === preset.id
                      ? 'bg-white text-black border-white shadow-lg scale-95'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md ${preset.color} flex items-center justify-center`}>
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-900" />
                    </div>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5 bg-zinc-900/40 flex gap-2">
              <input
                type="text"
                placeholder="Escribe al asistente de moda (ej. 'Pruébame la chaqueta leather')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-purple-500 text-sm placeholder-zinc-600 transition-colors"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:bg-white"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* RIGHT: Workspace & Interactive Try-On Canvas */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 glass rounded-[2.5rem] border border-white/5 min-h-[600px] shadow-2xl bg-zinc-900/10">
            
            {/* Case 1: Displaying Result with before/after comparison */}
            {tryOnStatus === 'success' && tryOnResult && personImage && (
              <div className="flex flex-col items-center gap-6 w-full max-w-[450px]">
                <ImageSlider 
                  beforeImage={personImage} 
                  afterImage={tryOnResult}
                  className="w-full"
                />
                
                <div className="flex gap-4 w-full">
                  <a 
                    href={tryOnResult}
                    download="smart-mirror-outfit.png"
                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Download className="w-5 h-5" />
                    Guardar Foto
                  </a>
                  
                  <button 
                    onClick={() => {
                      const item = presetGarments.find(p => p.id === selectedPreset);
                      alert(`Comprando: ${item ? item.name : 'Custom Outfit'}!`);
                    }}
                    className="flex-1 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Comprar Look
                  </button>
                </div>
                
                <button
                  onClick={clearTryOnStudio}
                  className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-4"
                >
                  Probar otra combinación
                </button>
              </div>
            )}

            {/* Case 2: Generating outfit loading viewport */}
            {(tryOnStatus === 'analyzing' || tryOnStatus === 'warping' || tryOnStatus === 'generating') && personImage && (
              <div className="flex flex-col items-center justify-center text-center w-full max-w-[400px]">
                <div className="relative w-48 h-64 rounded-3xl overflow-hidden border-2 border-dashed border-purple-500/50 mb-8 bg-zinc-950 flex items-center justify-center">
                  <img src={personImage} alt="Scanning source" className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-xs" />
                  
                  {/* Futuristic Scanning line */}
                  <div 
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-10 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    style={{
                      animation: 'scan 2s infinite ease-in-out',
                      top: `${tryOnProgress}%`
                    }}
                  />
                  <style jsx global>{`
                    @keyframes scan {
                      0% { top: 0%; }
                      50% { top: 100%; }
                      100% { top: 0%; }
                    }
                  `}</style>
                  
                  <div className="relative z-20 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                    <span className="text-xs font-semibold tracking-wider text-purple-300 uppercase">Cargando Mesh...</span>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Progreso IA</span>
                    <span className="font-bold text-purple-400">{tryOnProgress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full"
                      style={{ width: `${tryOnProgress}%` }}
                      layoutId="progress"
                      transition={{ ease: 'easeInOut' }}
                    />
                  </div>
                  
                  {/* Skeleton status indicator */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                    <div className="text-sm font-semibold">
                      {tryOnStatus === 'analyzing' && 'Fase 1: Detectando postura...'}
                      {tryOnStatus === 'warping' && 'Fase 2: Ajustando prendas...'}
                      {tryOnStatus === 'generating' && 'Fase 3: Renderizado final...'}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Nuestra IA procesa los puntos clave del torso para un acoplamiento perfecto de costura virtual.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: Error State */}
            {tryOnStatus === 'error' && (
              <div className="flex flex-col items-center text-center max-w-[350px]">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">Error de Generación</h4>
                <p className="text-sm text-zinc-500 mb-6">
                  No pudimos alinear el modelo con tu foto. Asegúrate de que tu cuerpo completo (hombros y torso) esté visible en la imagen.
                </p>
                <button
                  onClick={clearTryOnStudio}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold border border-white/5 transition-colors"
                >
                  Reintentar Subida
                </button>
              </div>
            )}

            {/* Case 4: Upload slots view */}
            {tryOnStatus === 'idle' && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Workspace Headers */}
                <div className="flex items-center gap-2 mb-8 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Try-On Interactive Board</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
                  
                  {/* Persona Upload Box */}
                  <div 
                    onClick={() => personInputRef.current?.click()}
                    className={`group relative aspect-[3/4] w-full max-w-[220px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-6 cursor-pointer overflow-hidden ${
                      personImage 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-zinc-800 hover:border-purple-500/40 hover:bg-purple-500/5 bg-zinc-950'
                    }`}
                  >
                    <input 
                      ref={personInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePersonFile} 
                    />
                    
                    {personImage ? (
                      <>
                        <img src={personImage} alt="User Person" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <RefreshCw className="w-8 h-8 text-white mb-2" />
                          <span className="text-xs font-bold text-white uppercase">Reemplazar foto</span>
                        </div>
                        {/* Status Check badge */}
                        <div className="absolute bottom-3 right-3 bg-green-500 text-black p-1.5 rounded-full shadow-lg z-20">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-zinc-400 group-hover:text-purple-400" />
                        </div>
                        <h4 className="text-sm font-bold mb-1">1. Sube tu foto</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal max-w-[150px]">
                          Cuerpo completo o medio cuerpo. Buena iluminación.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Garment Upload Box */}
                  <div 
                    onClick={() => garmentInputRef.current?.click()}
                    className={`group relative aspect-[3/4] w-full max-w-[220px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-6 cursor-pointer overflow-hidden ${
                      garmentImage 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-zinc-800 hover:border-purple-500/40 hover:bg-purple-500/5 bg-zinc-950'
                    }`}
                  >
                    <input 
                      ref={garmentInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleGarmentFile} 
                    />
                    
                    {garmentImage ? (
                      <>
                        <img src={garmentImage} alt="Selected Garment" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <RefreshCw className="w-8 h-8 text-white mb-2" />
                          <span className="text-xs font-bold text-white uppercase">Reemplazar prenda</span>
                        </div>
                        {/* Status Check badge */}
                        <div className="absolute bottom-3 right-3 bg-green-500 text-black p-1.5 rounded-full shadow-lg z-20">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6 text-zinc-400 group-hover:text-purple-400" />
                        </div>
                        <h4 className="text-sm font-bold mb-1">2. Sube la prenda</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal max-w-[150px]">
                          Foto del catálogo de ropa, PNG, chaqueta, camiseta, etc.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!personImage || !garmentImage}
                  className="mt-8 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  Generar Outfit con IA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
