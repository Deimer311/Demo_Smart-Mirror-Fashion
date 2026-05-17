'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stores = [
  { name: 'ZARA', logo: 'ZARA' },
  { name: 'H&M', logo: 'H&M' },
  { name: 'GUCCI', logo: 'GUCCI' },
  { name: 'PRADA', logo: 'PRADA' },
  { name: 'ASOS', logo: 'ASOS' },
  { name: 'NIKE', logo: 'NIKE' },
];

const Integrations = () => {
  return (
    <section className="py-20 bg-secondary/50 dark:bg-white/5 overflow-hidden">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-bold tracking-widest text-muted uppercase mb-12">
          Integrado con tus tiendas favoritas
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale opacity-50">
          {stores.map((store) => (
            <motion.div
              key={store.name}
              whileHover={{ scale: 1.1, filter: 'grayscale(0%)', opacity: 1 }}
              className="text-2xl md:text-4xl font-black tracking-tighter"
            >
              {store.logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
