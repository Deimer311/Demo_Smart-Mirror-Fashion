'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute top-0 right-0 w-[50%] h-full bg-white/5 skew-x-12 translate-x-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-bold text-background mb-8 leading-tight"
          >
            ¿Listo para transformar <br /> tu forma de vestir?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-xl mb-12"
          >
            Únete a miles de personas que ya están usando Smart Mirror para verse mejor cada día.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-6 bg-white text-black rounded-full font-bold text-xl shadow-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            Empieza gratis ahora
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
