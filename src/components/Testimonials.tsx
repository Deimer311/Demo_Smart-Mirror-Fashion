'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Elena Rodríguez',
    role: 'Influencer de Moda',
    content: 'Increíble cómo ahorra tiempo. Ya no tengo que ir a la tienda a probarme mil cosas, la IA lo hace perfecto.',
    avatar: 'ER',
  },
  {
    name: 'Carlos Mendez',
    role: 'Estudiante de Diseño',
    content: 'La interfaz es súper intuitiva. Parece magia ver cómo la ropa se ajusta a mi cuerpo en tiempo real.',
    avatar: 'CM',
  },
  {
    name: 'Sofía Valdés',
    role: 'Empresaria',
    content: 'Las recomendaciones de estilo son muy acertadas. He descubierto combinaciones que nunca se me hubieran ocurrido.',
    avatar: 'SV',
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros usuarios</h2>
          <p className="text-muted text-lg">Únete a la comunidad que está redescubriendo la moda.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-secondary dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 relative group"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-200 dark:text-zinc-800 group-hover:text-accent-pink transition-colors" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-muted leading-relaxed italic">
                "{t.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
