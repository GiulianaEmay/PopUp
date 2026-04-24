import products from "../data/products";

// WhatsApp — configura tu número en /app/frontend/.env como REACT_APP_WHATSAPP=51999999999
export const WA_NUMBER = process.env.REACT_APP_WHATSAPP || "51926915967";

export const CATEGORIES = [
  { slug: "vestidos", label: "Vestidos" },
  { slug: "blusas", label: "Blusas y Tops" },
  { slug: "faldas", label: "Faldas" },
  { slug: "pantalones", label: "Pantalones" },
  { slug: "conjuntos", label: "Conjuntos" },
];

export const getCategoryLabel = (slug) => {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? c.label : slug;
};

export const formatPrice = (price) =>
  `S/ ${Number(price).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Local API shim (para que las páginas sigan funcionando sin backend) ---
const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const filterProducts = (params = {}) => {
  let list = [...products];
  if (params.category && params.category !== "all") list = list.filter((p) => p.category === params.category);
  if (params.featured !== undefined) list = list.filter((p) => p.featured === params.featured);
  if (params.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (params.size) list = list.filter((p) => p.sizes.includes(params.size));
  if (params.min_price != null) list = list.filter((p) => p.price >= params.min_price);
  if (params.max_price != null) list = list.filter((p) => p.price <= params.max_price);
  if (params.limit) list = list.slice(0, params.limit);
  return list;
};

const api = {
  get: async (path, config = {}) => {
    await delay();
    const params = config.params || {};
    if (path === "/products") return { data: filterProducts(params) };
    const m = path.match(/^\/products\/(.+)$/);
    if (m) {
      const p = products.find((x) => x.id === m[1]);
      if (!p) {
        const err = new Error("Producto no encontrado");
        err.response = { data: { detail: "Producto no encontrado" }, status: 404 };
        throw err;
      }
      return { data: p };
    }
    const err = new Error("Unknown path: " + path);
    err.response = { data: { detail: "not found" }, status: 404 };
    throw err;
  },
};

export default api;

// --- WhatsApp helpers ---
export const buildWhatsAppUrl = (form, items, total) => {
  const lines = [];
  lines.push("*Nuevo pedido — Pop Up*");
  lines.push("");
  lines.push(`*Cliente:* ${form.customer_name}`);
  lines.push(`*Correo:* ${form.email}`);
  lines.push(`*Teléfono:* ${form.phone}`);
  lines.push(`*Dirección:* ${form.address}, ${form.city}${form.district ? " / " + form.district : ""}`);
  if (form.notes) lines.push(`*Notas:* ${form.notes}`);
  lines.push("");
  lines.push("*Productos:*");
  items.forEach((i) => {
    lines.push(`• ${i.name} — Talla ${i.size} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
  });
  lines.push("");
  lines.push(`*TOTAL: ${formatPrice(total)}*`);
  const msg = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
};
