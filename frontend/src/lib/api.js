import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("popup_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const formatPrice = (price) =>
  `S/ ${Number(price).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
