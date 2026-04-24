import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Heart, Truck, RotateCcw, Minus, Plus } from "lucide-react";
import api, { formatPrice, getCategoryLabel } from "../lib/api";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    api.get(`/products/${id}`)
      .then((r) => {
        setProduct(r.data);
        setSize(r.data.sizes?.[0] || "");
      })
      .catch(() => toast.error("Producto no encontrado"))
      .finally(() => setLoading(false));
  }, [id]);

  const onAdd = () => {
    if (!size) { toast.error("Selecciona una talla"); return; }
    addItem(product, size, qty);
    toast.success("Agregado al carrito");
  };

  if (loading) return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-10 grid md:grid-cols-2 gap-10" data-testid="product-loading">
      <div className="aspect-[3/4] rounded-2xl skeleton" />
      <div className="space-y-4">
        <div className="h-10 w-2/3 skeleton rounded-full" />
        <div className="h-6 w-1/3 skeleton rounded-full" />
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="bg-white" data-testid="product-detail-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 pt-6 md:pt-10 pb-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-body text-brand-muted hover:text-brand-accent mb-8" data-testid="back-to-shop">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Volver
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-brand-soft" data-testid="product-main-image">
              {product.images?.[activeImg] && (
                <img src={product.images[activeImg]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              )}
              {product.is_new && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-body text-brand-ink">
                  Nuevo
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? "border-brand-accent" : "border-transparent opacity-70"}`}
                    data-testid={`thumb-${i}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:pl-4 lg:pl-8 md:pt-4">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mb-3" data-testid="product-category">
              {getCategoryLabel(product.category)}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl text-brand-ink leading-tight mb-4" data-testid="product-name">{product.name}</h1>
            <p className="font-heading text-3xl text-brand-accent mb-8" data-testid="product-price">{formatPrice(product.price)}</p>

            <p className="font-body text-base text-brand-muted leading-relaxed mb-8" data-testid="product-description">{product.description}</p>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-body text-xs uppercase tracking-widest text-brand-ink">Talla</h4>
                <button className="font-body text-xs text-brand-muted underline">Guía de tallas</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-full border font-body text-sm transition-all ${size === s ? "bg-brand-ink text-white border-brand-ink" : "bg-white text-brand-ink border-brand-line hover:border-brand-accent"}`}
                    data-testid={`size-${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h4 className="font-body text-xs uppercase tracking-widest text-brand-ink mb-3">Cantidad</h4>
              <div className="inline-flex items-center border border-brand-line rounded-full">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-brand-ink hover:text-brand-accent" data-testid="qty-dec">
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-11 text-center font-body text-sm" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-11 h-11 flex items-center justify-center text-brand-ink hover:text-brand-accent" data-testid="qty-inc">
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={onAdd}
                className="flex-1 bg-brand-ink text-white hover:bg-brand-accent transition-all rounded-full py-4 text-xs uppercase tracking-[0.2em] font-body"
                data-testid="add-to-cart-button"
              >
                Agregar al carrito
              </button>
              <button className="w-12 h-12 sm:w-14 sm:h-14 border border-brand-line rounded-full flex items-center justify-center text-brand-ink hover:border-brand-accent hover:text-brand-accent transition-colors" aria-label="Favorito" data-testid="wishlist-btn">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Perks */}
            <div className="border-t border-brand-line pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm font-body text-brand-ink">
                <Truck className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
                Envío gratis en compras desde S/ 199
              </div>
              <div className="flex items-center gap-3 text-sm font-body text-brand-ink">
                <RotateCcw className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
                Cambios dentro de 7 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
