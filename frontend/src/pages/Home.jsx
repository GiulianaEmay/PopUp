import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../lib/api";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/eb0d2a034d636d7e5f97ff3473c1bd616d66bc16df50d8512bf9c4f1134a4773.png";
const HERO2 = "https://images.pexels.com/photos/7872805/pexels-photo-7872805.jpeg";

const CATEGORY_IMAGES = {
  vestidos: "https://images.unsplash.com/photo-1653286431693-2bbde8b10e14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tZW4lMjBkcmVzcyUyMHBhc3RlbHxlbnwwfHx8fDE3NzcwNTE2OTJ8MA&ixlib=rb-4.1.0&q=85",
  blusas: "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/e567ae3faca490a10a29e55330f17000c495275f5aaf1289445a7f2d34b22f67.png",
  faldas: "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/ebbe02c69cdea875ef6b1acd5aeed509c783df10684487cda2658e09147fc21f.png",
  pantalones: "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBhc3RlbCUyMG1pbmltYWx8ZW58MHx8fHwxNzc3MDUxNjkyfDA&ixlib=rb-4.1.0&q=85",
  conjuntos: "https://images.pexels.com/photos/7691223/pexels-photo-7691223.jpeg",
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    api.get("/products", { params: { featured: true, limit: 8 } }).then((r) => setFeatured(r.data)).catch(() => {});
    api.get("/products", { params: { limit: 8 } }).then((r) => setNewArrivals(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-white" data-testid="home-page">
      {/* HERO */}
      <section className="relative" data-testid="hero-section">
        <div className="relative min-h-[80vh] md:min-h-[88vh] overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem]">
          <img src={HERO_IMG} alt="Pop Up hero" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/50" />
          <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 h-full min-h-[80vh] md:min-h-[88vh] flex items-end pb-16 md:pb-24">
            <div className="max-w-2xl fade-up">
              <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-ink/80 mb-4">Colección Primavera</p>
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-brand-ink leading-[0.95] tracking-tight mb-6">
                Delicadeza en<br/>cada prenda.
              </h1>
              <p className="font-body text-base md:text-lg text-brand-ink/80 max-w-md leading-relaxed mb-8">
                Piezas suaves, femeninas y atemporales para mujeres que celebran su esencia.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="bg-brand-ink text-white hover:bg-brand-accent transition-all duration-300 rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2" data-testid="hero-shop-cta">
                  Explorar colección <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <Link to="/shop?category=vestidos" className="bg-white/80 backdrop-blur text-brand-ink hover:bg-brand transition-all duration-300 rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-body" data-testid="hero-dresses-cta">
                  Ver vestidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-6 border-y border-brand-line bg-brand-soft overflow-hidden" data-testid="marquee-section">
        <div className="flex animate-marquee whitespace-nowrap font-heading text-3xl md:text-4xl text-brand-ink italic">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 pr-12">
              <span>Nueva colección</span><span className="text-brand-accent">✿</span>
              <span>Envío gratis S/ 199+</span><span className="text-brand-accent">✿</span>
              <span>Hecho con amor</span><span className="text-brand-accent">✿</span>
              <span>Made for her</span><span className="text-brand-accent">✿</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories bento */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28" data-testid="categories-section">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-3">Categorías</p>
            <h2 className="font-heading text-4xl md:text-6xl text-brand-ink leading-tight">Encuentra tu estilo</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-sm font-body text-brand-ink hover:text-brand-accent transition-colors">
            Ver todo <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className={`relative overflow-hidden rounded-3xl group ${idx === 0 ? "md:col-span-2 md:row-span-2 aspect-[3/4] md:aspect-auto" : "aspect-[3/4]"}`}
              data-testid={`category-card-${cat.slug}`}
            >
              <img src={CATEGORY_IMAGES[cat.slug]} alt={cat.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <h3 className="font-heading text-2xl md:text-4xl text-white">{cat.label}</h3>
                <p className="font-body text-xs uppercase tracking-[0.2em] text-white/80 mt-2 group-hover:text-brand transition-colors">Explorar →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28" data-testid="featured-section">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-3">Destacados</p>
              <h2 className="font-heading text-4xl md:text-6xl text-brand-ink">Los favoritos</h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-sm font-body text-brand-ink hover:text-brand-accent transition-colors">
              Ver todo <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featured.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Editorial split */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28" data-testid="editorial-section">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <img src={HERO2} alt="Editorial" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-4">Sobre Pop Up</p>
            <h2 className="font-heading text-4xl md:text-6xl text-brand-ink leading-tight mb-6">
              Para la mujer que celebra<br/><em className="italic text-brand-accent">su esencia.</em>
            </h2>
            <p className="font-body text-base text-brand-muted leading-relaxed mb-4">
              En Pop Up creemos que la moda debe ser suave, delicada y personal. Curamos cada pieza con cariño, pensando en mujeres reales que buscan piezas atemporales.
            </p>
            <p className="font-body text-base text-brand-muted leading-relaxed mb-8">
              Colores pastel, tejidos suaves y diseños cuidadosamente elegidos — para que cada prenda se sienta como tuya desde el primer momento.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 border border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white transition-all duration-300 rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-body" data-testid="editorial-cta">
              Explorar todo <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 pb-20 md:pb-28" data-testid="new-arrivals-section">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-3">Nuevo</p>
              <h2 className="font-heading text-4xl md:text-6xl text-brand-ink">Recién llegados</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
