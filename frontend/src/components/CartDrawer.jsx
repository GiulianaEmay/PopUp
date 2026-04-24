import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { Sheet, SheetContent } from "./ui/sheet";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/api";

const CartDrawer = () => {
  const { open, setOpen, items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 flex flex-col" data-testid="cart-drawer">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-line">
          <h2 className="font-heading text-2xl text-brand-ink">Tu carrito</h2>
          <button onClick={() => setOpen(false)} className="text-brand-ink hover:text-brand-accent" data-testid="cart-close">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-heading text-3xl text-brand-ink mb-2">Tu carrito está vacío</p>
              <p className="font-body text-sm text-brand-muted mb-8">Descubre prendas que te enamorarán.</p>
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="inline-block bg-brand hover:bg-brand-hover transition-colors rounded-full px-8 py-3 text-sm uppercase tracking-widest text-brand-ink font-body"
                data-testid="cart-empty-shop-btn"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4" data-testid={`cart-item-${item.product_id}`}>
                  <div className="w-24 h-32 rounded-2xl overflow-hidden bg-brand-soft flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-body text-sm text-brand-ink leading-snug">{item.name}</h4>
                      <button onClick={() => removeItem(item.key)} className="text-brand-muted hover:text-brand-accent" data-testid={`cart-remove-${item.product_id}`}>
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="font-body text-xs text-brand-muted mt-1 uppercase tracking-widest">Talla: {item.size}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-brand-line rounded-full">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-brand-ink hover:text-brand-accent"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          data-testid={`cart-dec-${item.product_id}`}
                        >
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-brand-ink hover:text-brand-accent"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          data-testid={`cart-inc-${item.product_id}`}
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="font-body text-sm text-brand-ink">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-line px-6 py-5 bg-brand-soft">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-body text-sm uppercase tracking-widest text-brand-muted">Subtotal</span>
              <span className="font-heading text-2xl text-brand-ink" data-testid="cart-total">{formatPrice(total)}</span>
            </div>
            <button
              onClick={goCheckout}
              className="w-full bg-brand-ink text-white hover:bg-brand-accent transition-colors rounded-full py-4 text-sm uppercase tracking-widest font-body"
              data-testid="cart-checkout-btn"
            >
              Ir al checkout
            </button>
            <p className="font-body text-xs text-brand-muted text-center mt-3">Envío calculado en el checkout</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
