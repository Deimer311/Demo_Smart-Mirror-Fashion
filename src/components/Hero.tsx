'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Camera, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-accent-pink rounded-full blur-[120px] opacity-30 dark:opacity-10" />
      <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-accent-blue rounded-full blur-[120px] opacity-30 dark:opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-gray-100 dark:border-gray-800 mb-8"
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                La revolución del Fitting Room
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 gradient-text"
            >
              Prueba tu outfit <br /> 
              <span className="text-black dark:text-white">sin cambiarte</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Descubre cómo te verías con cualquier ropa usando inteligencia artificial. 
              Experimenta la moda del futuro desde la comodidad de tu hogar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button className="w-full sm:w-auto px-10 py-5 bg-primary text-background rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group">
                Probar ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 border border-gray-200 dark:border-gray-800 rounded-full font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" />
                Ver demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center justify-center lg:justify-start gap-8"
            >
              <div>
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-sm text-muted">Outfits probados</div>
              </div>
              <div className="w-[1px] h-10 bg-gray-200 dark:bg-gray-800" />
              <div>
                <div className="text-2xl font-bold">99%</div>
                <div className="text-sm text-muted">Precisión IA</div>
              </div>
            </motion.div>
          </div>

          {/* Image/Mirror Simulation */}
          <div className="flex-1 relative w-full max-w-[600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-gray-900 dark:border-gray-800"
            >
              <Image
                src="/images/hero-mirror.png"
                alt="Smart Mirror Simulation"
                width={600}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
              
              {/* Interface Overlay simulation */}
              <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    LIVE AI SCANNING
                  </div>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 w-fit self-end"
                  >
                    <div className="w-10 h-10 bg-accent-pink rounded-lg" />
                    <div>
                      <div className="text-[10px] font-bold">Silk Summer Dress</div>
                      <div className="text-[8px] opacity-60">Recomendado para ti</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 w-fit self-end"
                  >
                    <div className="w-10 h-10 bg-accent-blue rounded-lg" />
                    <div>
                      <div className="text-[10px] font-bold">Denim Jacket V2</div>
                      <div className="text-[8px] opacity-60">95% Match</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative rings */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-dashed border-gray-300 dark:border-gray-700 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent-pink rounded-full opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
