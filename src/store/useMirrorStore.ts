import { create } from 'zustand';

export interface Garment {
  id: string;
  name: string;
  type: 'top' | 'bottom' | 'full';
  image: string;
  color?: string;
  price?: string;
}

interface MirrorState {
  isCameraActive: boolean;
  isModelLoading: boolean;
  selectedGarment: Garment | null;
  outfit: Garment[];
  poseLandmarks: any | null;
  
  // Actions
  setCameraActive: (active: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setSelectedGarment: (garment: Garment | null) => void;
  addToOutfit: (garment: Garment) => void;
  removeFromOutfit: (id: string) => void;
  setPoseLandmarks: (landmarks: any) => void;
  resetMirror: () => void;
}

export const useMirrorStore = create<MirrorState>((set) => ({
  isCameraActive: false,
  isModelLoading: false,
  selectedGarment: null,
  outfit: [],
  poseLandmarks: null,

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
}));
