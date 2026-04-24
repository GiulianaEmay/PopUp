import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { CATEGORIES, getCategoryLabel } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL"];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const search = params.get("search") || "";
  const size = params.get("size") || "";
  const sort = params.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p = {};
    if (category !== "all") p.category = category;
    if (search) p.search = search;
    if (size) p.size = size;
    api.get("/products", { params: p })
      .then((r) => {
        let data = [...r.data];
        if (sort === "price_asc") data.sort((a,b) => a.price - b.price);
        if (sort === "price_desc") data.sort((a,b) => b.price - a.price);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, [category, search, size, sort]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (!v || v === "all") next.delete(k); else next.set(k, v);
    setParams(next);
  };

  const title = category === "all"
    ? (search ? `Resultados: "${search}"` : "Toda la colección")
    : getCategoryLabel(category);

  return (
    <div className="bg-white min-h-screen" data-testid="shop-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 pt-10 md:pt-16 pb-20">
        <div className="mb-10 md:mb-14">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-3">Tienda</p>
          <h1 className="font-heading text-5xl md:text-7xl text-brand-ink leading-tight" data-testid="shop-title">{title}</h1>
          <p className="font-body text-sm text-brand-muted mt-4">{products.length} prendas encontradas</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          <button
            onClick={() => setParam("category", "all")}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs uppercase tracking-widest font-body border transition-all ${category === "all" ? "bg-brand-ink text-white border-brand-ink" : "bg-white text-brand-ink border-brand-line hover:border-brand-accent"}`}
            data-testid="filter-cat-all"
          >
            Todo
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam("category", c.slug)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs uppercase tracking-widest font-body border transition-all ${category === c.slug ? "bg-brand-ink text-white border-brand-ink" : "bg-white text-brand-ink border-brand-line hover:border-brand-accent"}`}
              data-testid={`filter-cat-${c.slug}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filter/sort bar */}
        <div className="flex items-center justify-between mb-10 border-y border-brand-line py-4">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-body text-brand-ink hover:text-brand-accent"
            data-testid="filter-toggle"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} /> Filtros
          </button>
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-widest font-body text-brand-muted hidden md:block">Ordenar</label>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="bg-transparent border border-brand-line rounded-full px-4 py-2 text-xs font-body text-brand-ink focus:outline-none focus:border-brand-accent"
              data-testid="sort-select"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-brand-soft rounded-3xl p-6 mb-10 fade-up" data-testid="filters-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-xs uppercase tracking-widest text-brand-muted">Talla</h3>
              {size && (
                <button onClick={() => setParam("size", "")} className="text-xs text-brand-accent flex items-center gap-1">
                  Limpiar <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setParam("size", size === s ? "" : s)}
                  className={`w-11 h-11 rounded-full border font-body text-sm transition-all ${size === s ? "bg-brand-ink text-white border-brand-ink" : "bg-white text-brand-ink border-brand-line hover:border-brand-accent"}`}
                  data-testid={`filter-size-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-3xl text-brand-ink mb-2">Nada por aquí</p>
            <p className="font-body text-sm text-brand-muted">Prueba con otra categoría o búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8" data-testid="products-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
