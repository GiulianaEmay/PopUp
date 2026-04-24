import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { formatPrice, buildWhatsAppUrl } from "../lib/api";
import { useCart } from "../context/CartContext";
import { ArrowLeft } from "lucide-react";

const Checkout = () => {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "",
    address: "", city: "", district: "", notes: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const url = buildWhatsAppUrl(form, items, total);
      const orderId = Date.now().toString(36).toUpperCase();
      // abrir WhatsApp en nueva pestaña
      window.open(url, "_blank", "noopener,noreferrer");
      clear();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      toast.error("Error al preparar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center" data-testid="checkout-empty">
        <h1 className="font-heading text-4xl md:text-5xl text-brand-ink mb-4">Tu carrito está vacío</h1>
        <p className="font-body text-brand-muted mb-8">Agrega prendas antes de ir al checkout.</p>
        <Link to="/shop" className="inline-block bg-brand-ink text-white rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-body hover:bg-brand-accent transition-colors">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="checkout-page">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-14 py-10 md:py-16">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-body text-brand-muted hover:text-brand-accent mb-8">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Seguir comprando
        </Link>

        <h1 className="font-heading text-5xl md:text-6xl text-brand-ink mb-4">Finalizar compra</h1>
        <p className="font-body text-sm text-brand-muted mb-10 max-w-xl">
          Completa tus datos y te redirigiremos a <span className="text-brand-accent font-medium">WhatsApp</span> con el resumen del pedido para coordinar el pago y envío.
        </p>

        <form onSubmit={submit} className="grid lg:grid-cols-[1fr,420px] gap-10 lg:gap-16">
          {/* Form */}
          <div className="space-y-10">
            <section>
              <h2 className="font-heading text-2xl text-brand-ink mb-5">Tus datos</h2>
              <div className="space-y-4">
                <Field label="Nombre completo" value={form.customer_name} onChange={update("customer_name")} required data-testid="checkout-name" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Correo" type="email" value={form.email} onChange={update("email")} required data-testid="checkout-email" />
                  <Field label="Teléfono" type="tel" value={form.phone} onChange={update("phone")} required data-testid="checkout-phone" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-brand-ink mb-5">Envío</h2>
              <div className="space-y-4">
                <Field label="Dirección" value={form.address} onChange={update("address")} required data-testid="checkout-address" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Ciudad" value={form.city} onChange={update("city")} required data-testid="checkout-city" />
                  <Field label="Distrito" value={form.district} onChange={update("district")} data-testid="checkout-district" />
                </div>
                <Field label="Notas (opcional)" value={form.notes} onChange={update("notes")} multiline data-testid="checkout-notes" />
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-ink text-white hover:bg-brand-accent transition-all rounded-full py-5 text-xs uppercase tracking-[0.2em] font-body disabled:opacity-50 inline-flex items-center justify-center gap-2"
              data-testid="checkout-submit-button"
            >
              {loading ? "Enviando..." : (<>Enviar por WhatsApp — {formatPrice(total)}</>)}
            </button>

            <p className="font-body text-xs text-brand-muted leading-relaxed">
              Al confirmar se abrirá WhatsApp con el resumen de tu pedido. Coordinaremos el pago (Yape, Plin, transferencia) y el envío directamente por ese medio.
            </p>
          </div>

          {/* Summary */}
          <aside className="bg-brand-soft rounded-3xl p-6 md:p-8 h-fit lg:sticky lg:top-28" data-testid="checkout-summary">
            <h2 className="font-heading text-2xl text-brand-ink mb-5">Tu pedido</h2>
            <ul className="space-y-4 mb-6">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3" data-testid={`summary-item-${i.product_id}`}>
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-brand-ink leading-tight">{i.name}</p>
                    <p className="font-body text-xs text-brand-muted mt-1">Talla {i.size} · Cant. {i.quantity}</p>
                  </div>
                  <p className="font-body text-sm text-brand-ink">{formatPrice(i.price * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-line pt-4 space-y-2">
              <div className="flex justify-between font-body text-sm text-brand-muted">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-brand-muted">
                <span>Envío</span><span>{total >= 199 ? "Gratis" : "A coordinar"}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-brand-line">
                <span className="font-body text-xs uppercase tracking-widest text-brand-ink">Total</span>
                <span className="font-heading text-2xl text-brand-ink">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, multiline, ...props }) => (
  <label className="block">
    <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">{label}</span>
    {multiline ? (
      <textarea
        rows={3}
        {...props}
        className="w-full bg-white border border-brand-line rounded-2xl px-4 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent transition-colors"
      />
    ) : (
      <input
        {...props}
        className="w-full bg-white border border-brand-line rounded-full px-5 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent transition-colors"
      />
    )}
  </label>
);

export default Checkout;
