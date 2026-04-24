import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../lib/api";

const ProductCard = ({ product, index = 0 }) => {
  const image = product.images?.[0];
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block fade-up"
      style={{ animationDelay: `${index * 0.04}s` }}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-soft">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 skeleton" />
        )}
        {product.is_new && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-body text-brand-ink">
            Nuevo
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-white/95 backdrop-blur-sm rounded-full py-2.5 text-center text-xs uppercase tracking-[0.15em] text-brand-ink font-body">
            Ver prenda
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-body text-sm text-brand-ink leading-snug">{product.name}</h3>
        <p className="font-body text-sm text-brand-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
