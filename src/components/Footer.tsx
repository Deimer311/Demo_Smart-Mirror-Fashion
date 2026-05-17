'use client';

import React from 'react';
import { Square, Camera, Users, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black py-20 border-t border-gray-100 dark:border-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-8">
               <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Square className="text-white dark:text-black w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">SmartMirror</span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Redefiniendo la moda a través de la inteligencia artificial y la visión por computadora.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Users className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-8">Producto</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Cómo funciona</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Precios</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">App Mobile</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Para tiendas</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-8">Compañía</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Prensa</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-8">Contacto</h4>
            <div className="flex items-center gap-3 text-sm text-muted mb-4">
              <Mail className="w-4 h-4" />
              <span>hola@smartmirror.fashion</span>
            </div>
            <div className="bg-secondary p-6 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-4">Newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm w-full outline-none focus:border-primary transition-colors"
                />
                <button className="bg-primary text-background px-4 py-2 rounded-lg text-sm font-bold">OK</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            © 2026 Smart Mirror Fashion. Todos los derechos reservados.
          </p>
          <div className="flex gap-8 text-xs text-muted">
            <a href="#" className="hover:text-primary">Privacidad</a>
            <a href="#" className="hover:text-primary">Términos</a>
            <a href="#" className="hover:text-primary">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
