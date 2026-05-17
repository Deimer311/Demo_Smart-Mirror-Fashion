'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Shirt, CheckCircle, Sparkles } from 'lucide-react';

const steps = [
  {
    title: 'Activa la cámara',
    description: 'Ponte frente a tu dispositivo y deja que nuestra IA analice tu silueta en segundos.',
    icon: Camera,
    color: 'bg-accent-blue',
  },
  {
    title: 'Elige ropa virtual',
    description: 'Explora nuestro catálogo infinito y pruébate prendas con un solo toque.',
    icon: Shirt,
    color: 'bg-accent-pink',
  },
  {
    title: 'Recibe recomendaciones',
    description: 'Nuestra IA sugiere combinaciones basadas en tu estilo y tipo de cuerpo.',
    icon: Sparkles,
    color: 'bg-yellow-50',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            ¿Cómo funciona?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted text-lg"
          >
            Transformamos la forma en que eliges tu ropa. Tres pasos sencillos para un estilo impecable.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300 dark:bg-opacity-20`}>
                <step.icon className="w-8 h-8 text-gray-800 dark:text-gray-200" />
              </div>
              <div className="bg-white dark:bg-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md mb-6 border border-gray-100 dark:border-gray-800">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
