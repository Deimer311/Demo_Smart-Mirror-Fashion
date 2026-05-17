'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap, ShoppingCart } from 'lucide-react';

const benefits = [
  {
    title: 'Ahorra tiempo',
    description: 'Olvídate de las colas en los probadores. Encuentra tu look ideal en segundos.',
    icon: Clock,
  },
  {
    title: 'Mejora tu estilo',
    description: 'Recibe sugerencias personalizadas que realzan tu silueta y combinan con tu armario.',
    icon: TrendingUp,
  },
  {
    title: 'Prueba sin esfuerzo',
    description: 'Visualiza cientos de prendas sin moverte. La comodidad de lo virtual en tu casa.',
    icon: Zap,
  },
  {
    title: 'Compra directo',
    description: '¿Te gusta lo que ves? Cómpralo al instante desde nuestras tiendas asociadas.',
    icon: ShoppingCart,
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-24 bg-white dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-8 leading-tight"
            >
              Beneficios que <br />
              <span className="text-muted italic">cambian las reglas</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted text-lg mb-12"
            >
              Smart Mirror no es solo tecnología, es tu asistente personal de moda disponible 24/7.
            </motion.p>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-xl group"
                >
                  <benefit.icon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-primary transition-colors" />
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                 {/* Placeholder for a secondary image if needed, or just a stylized block */}
                 <div className="text-center p-12">
                   <div className="text-6xl font-bold mb-4">90%</div>
                   <p className="text-muted">De los usuarios encuentran su outfit en menos de 2 minutos.</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
