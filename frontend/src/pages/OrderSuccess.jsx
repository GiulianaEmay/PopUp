import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api, { formatPrice } from "../lib/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Public order fetch not enabled; but we can show summary via ID success
    setOrder({ id });
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center" data-testid="order-success-page">
      <div className="w-20 h-20 bg-brand rounded-full mx-auto flex items-center justify-center mb-8">
        <CheckCircle2 className="w-10 h-10 text-brand-ink" strokeWidth={1.5} />
      </div>
      <h1 className="font-heading text-5xl md:text-6xl text-brand-ink mb-4">¡Gracias!</h1>
      <p className="font-body text-base md:text-lg text-brand-muted leading-relaxed mb-2">
        Tu pedido fue recibido correctamente. Te contactaremos por WhatsApp o correo para coordinar el pago y el envío.
      </p>
      {order?.id && (
        <p className="font-body text-xs uppercase tracking-widest text-brand-ink mt-6" data-testid="order-id">
          Nº Pedido · {order.id.slice(0, 8).toUpperCase()}
        </p>
      )}
      <div className="mt-10">
        <Link to="/shop" className="inline-block bg-brand-ink text-white rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em] font-body hover:bg-brand-accent transition-colors" data-testid="order-success-continue">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
