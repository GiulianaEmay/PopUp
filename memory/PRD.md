# Pop Up — E-commerce Boutique Femenina

## Problem Statement (original)
> haremos una tienda de ropa estilo https://pe.hm.com/ con el nombre de Pop Up. prendas de ropa solo para dama, quiero subirlo en netlify entonces go. colores que predominan, blanco, rosa pastel y variantes

## Product Vision
Boutique online femenina elegante, minimalista, inspirada en H&M pero con paleta pastel (blanco + rosa empolvado + acentos rose gold). Experiencia de compra como invitado, catálogo curado, panel admin para gestionar productos y pedidos.

## User Personas
- **Clienta invitada**: mujer que navega, agrega al carrito y hace checkout sin crear cuenta.
- **Administradora (equipo Pop Up)**: única con acceso a panel para gestionar catálogo y ver pedidos.

## Core Requirements (static)
- Sin pasarela de pago; checkout captura datos y crea pedido
- Compra como invitado (sin registro)
- Login JWT solo para admin (seed automático)
- Categorías: Vestidos, Blusas y Tops, Faldas, Pantalones, Conjuntos
- Paleta: blanco #FFFFFF, rosa pastel #F4D7D9, accent dusty rose #D19B9F
- Tipografía: Cormorant Garamond (heading) + Outfit (body)

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT Bearer auth (admin). Seed on startup.
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner toasts
- **State**: CartContext (localStorage) + AuthContext (localStorage token)

## Implemented (2026-02-24)
### Backend
- [x] Models: Product, Order, User
- [x] Auth: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout (admin JWT bearer)
- [x] Products: GET list with filters (category, featured, search, size, price range), GET detail, admin POST/PUT/DELETE
- [x] Orders: POST public guest, admin GET list / GET detail / PATCH status
- [x] Seed admin idempotente + 12 productos iniciales en 5 categorías
- [x] MongoDB indexes (users.email unique, products.id, products.category, orders.id)

### Frontend
- [x] Home: hero glassmorphism, marquee, bento categorías, featured, editorial split, new arrivals
- [x] Shop: pills de categoría, filtros de talla, sort por precio, grid responsive
- [x] ProductDetail: galería con thumbnails, selector tallas, qty, add-to-cart, perks
- [x] CartDrawer (Sheet) con qty +/-, remove, subtotal
- [x] Checkout guest con resumen sticky y validación
- [x] OrderSuccess con ID
- [x] Admin Login (rechaza credenciales inválidas)
- [x] Admin Dashboard: stats, tabs Productos/Pedidos, dialog CRUD con selector de tallas e imágenes múltiples, cambio de estado de pedido

### Testing
- [x] 23/23 pytest backend passed
- [x] Frontend 100% flujos críticos validados por testing subagent

## Prioritized Backlog
### P1 (siguiente iteración)
- Sistema de favoritos/wishlist persistente
- Variantes por color del producto
- Multi-imagen upload con object storage (reemplazar input de URL)
- Notificación de pedido al admin por email (Resend) + WhatsApp link al cliente
- Guía de tallas modal real

### P2
- Búsqueda con autocompletado
- Paginación en admin (actualmente limit 200)
- Cupones/descuentos
- Integración de pasarela de pago (Stripe / Culqi) si el negocio lo pide
- Analíticas básicas (productos más vistos, conversión)

## Credentials
- Admin: `admin@popup.com` / `popup2026`
- Ver `/app/memory/test_credentials.md`

## Deployment Target
- Netlify (frontend) — backend en Emergent platform
