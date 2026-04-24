import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin } from "lucide-react";
import { CATEGORIES } from "../lib/api";

const Footer = () => {
  return (
    <footer className="bg-brand-soft border-t border-brand-line mt-24" data-testid="main-footer">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14">
          <div className="md:col-span-2">
            <h3 className="font-heading text-4xl md:text-5xl text-brand-ink mb-4">Pop Up</h3>
            <p className="font-body text-sm text-brand-muted leading-relaxed max-w-md">
              Prendas femeninas cuidadosamente curadas para mujeres que aman lo suave, lo delicado y lo atemporal.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white border border-brand-line flex items-center justify-center text-brand-ink hover:bg-brand hover:border-brand-accent transition-colors" aria-label="Instagram" data-testid="footer-instagram">
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a href="mailto:hola@popup.com" className="w-10 h-10 rounded-full bg-white border border-brand-line flex items-center justify-center text-brand-ink hover:bg-brand hover:border-brand-accent transition-colors" aria-label="Email" data-testid="footer-email">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-brand-muted mb-5">Tienda</h4>
            <ul className="space-y-3 font-body text-sm text-brand-ink">
              <li><Link to="/shop" className="hover:text-brand-accent transition-colors">Todas las prendas</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${c.slug}`} className="hover:text-brand-accent transition-colors">{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-brand-muted mb-5">Ayuda</h4>
            <ul className="space-y-3 font-body text-sm text-brand-ink">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-brand-accent" strokeWidth={1.5} />Lima, Perú</li>
              <li>Envíos a todo el país</li>
              <li>Política de cambios</li>
              <li>Guía de tallas</li>
              <li><Link to="/admin/login" className="hover:text-brand-accent transition-colors" data-testid="footer-admin-link">Administración</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-brand-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-brand-muted">© {new Date().getFullYear()} Pop Up — Hecho con cariño.</p>
          <p className="font-body text-xs text-brand-muted uppercase tracking-widest">Mujer · Elegancia · Movimiento</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
