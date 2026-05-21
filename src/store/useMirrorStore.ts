import { create } from 'zustand';

export interface Garment {
  id: string;
  name: string;
  type: 'top' | 'bottom' | 'full';
  image: string;
  color?: string;
  price?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: Date;
}

interface MirrorState {
  isCameraActive: boolean;
  isModelLoading: boolean;
  selectedGarment: Garment | null;
  outfit: Garment[];
  poseLandmarks: any | null;
  
  // AI Try-On Room State
  personImage: string | null;
  garmentImage: string | null;
  tryOnResult: string | null;
  tryOnStatus: 'idle' | 'analyzing' | 'warping' | 'generating' | 'success' | 'error';
  tryOnProgress: number;
  tryOnMessages: ChatMessage[];

  // Actions
  setCameraActive: (active: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setSelectedGarment: (garment: Garment | null) => void;
  addToOutfit: (garment: Garment) => void;
  removeFromOutfit: (id: string) => void;
  setPoseLandmarks: (landmarks: any) => void;
  resetMirror: () => void;

  // AI Try-On Actions
  setPersonImage: (image: string | null) => void;
  setGarmentImage: (image: string | null) => void;
  setTryOnResult: (result: string | null) => void;
  setTryOnStatus: (status: 'idle' | 'analyzing' | 'warping' | 'generating' | 'success' | 'error') => void;
  setTryOnProgress: (progress: number) => void;
  addTryOnMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearTryOnStudio: () => void;
}

export const useMirrorStore = create<MirrorState>((set) => ({
  isCameraActive: false,
  isModelLoading: false,
  selectedGarment: null,
  outfit: [],
  poseLandmarks: null,

  // AI Try-On Room Default State
  personImage: null,
  garmentImage: null,
  tryOnResult: null,
  tryOnStatus: 'idle',
  tryOnProgress: 0,
  tryOnMessages: [
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu Asistente Personal de Moda. Aquí puedes subir tu foto y una prenda que te guste para que nuestra Inteligencia Artificial cree un try-on ultra realista en segundos. ¿Con qué prenda empezamos hoy?',
      timestamp: new Date()
    }
  ],

  setCameraActive: (active) => set({ isCameraActive: active }),
  setModelLoading: (loading) => set({ isModelLoading: loading }),
  setSelectedGarment: (garment) => set({ selectedGarment: garment }),
  
  addToOutfit: (garment) => set((state) => ({ 
    outfit: [...state.outfit.filter(g => g.type !== garment.type), garment] 
  })),
  
  removeFromOutfit: (id) => set((state) => ({ 
    outfit: state.outfit.filter((g) => g.id !== id) 
  })),
  
  setPoseLandmarks: (landmarks) => set({ poseLandmarks: landmarks }),
  
  resetMirror: () => set({ 
    selectedGarment: null, 
    outfit: [], 
    poseLandmarks: null 
  }),

  // AI Try-On Actions Implementation
  setPersonImage: (image) => set({ personImage: image }),
  setGarmentImage: (image) => set({ garmentImage: image }),
  setTryOnResult: (result) => set({ tryOnResult: result }),
  setTryOnStatus: (status) => set({ tryOnStatus: status }),
  setTryOnProgress: (progress) => set({ tryOnProgress: progress }),
  addTryOnMessage: (message) => set((state) => ({
    tryOnMessages: [
      ...state.tryOnMessages,
      {
        ...message,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date()
      }
    ]
  })),
  clearTryOnStudio: () => set({
    personImage: null,
    garmentImage: null,
    tryOnResult: null,
    tryOnStatus: 'idle',
    tryOnProgress: 0,
    tryOnMessages: [
      {
        id: 'welcome',
        sender: 'assistant',
        text: '¡Hola! Soy tu Asistente Personal de Moda. Aquí puedes subir tu foto y una prenda que te guste para que nuestra Inteligencia Artificial cree un try-on ultra realista en segundos. ¿Con qué prenda empezamos hoy?',
        timestamp: new Date()
      }
    ]
  })
}));
