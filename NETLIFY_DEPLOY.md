# Pop Up — Deploy a Netlify

Esta app ahora funciona **100% en el frontend** (sin backend). Los productos están en `frontend/src/data/products.js` y el checkout envía los pedidos por **WhatsApp**.

---

## 🚀 Deploy en 3 pasos

### Opción A — Drag & Drop (rápido, sin cuenta de GitHub)

1. Desde tu máquina local (o descargando el código):
   ```bash
   cd frontend
   yarn install
   yarn build
   ```
   Esto genera la carpeta `frontend/build/`.

2. Entra a https://app.netlify.com/drop

3. Arrastra la carpeta `frontend/build/` al área de drop. ¡Listo!

---

### Opción B — Conectar con GitHub (recomendado, auto-deploy)

1. Sube el código a un repositorio de GitHub (desde Emergent: botón **Save to GitHub**).

2. En Netlify → **"Add new site" → "Import an existing project"** → GitHub → selecciona tu repo.

3. Netlify leerá el archivo `netlify.toml` automáticamente, pero verifica que los valores sean:
   - **Base directory**: `frontend`
   - **Build command**: `yarn build`
   - **Publish directory**: `frontend/build`

4. (Opcional) Agrega variable de entorno:
   - `REACT_APP_WHATSAPP` = `51926915967` (tu número)
   - Netlify → Site settings → Environment variables

5. Deploy. Cada push a `main` redeploya automáticamente.

---

## ✏️ Cómo editar productos

Abre `frontend/src/data/products.js` y modifica el array. Cada producto tiene:

```js
{
  id: "v-001",             // único
  name: "Nombre",
  description: "...",
  price: 189.00,           // en soles
  category: "vestidos",    // vestidos | blusas | faldas | pantalones | conjuntos
  sizes: ["S", "M", "L"],
  images: ["https://..."], // URLs (Cloudinary, Imgur, etc.)
  stock: 10,
  featured: true,          // destacado en home
  is_new: true,            // badge "Nuevo"
}
```

Luego haz commit/push (o rebuild local) y Netlify redeploya.

---

## 📱 Cambiar tu número de WhatsApp

Opción 1 — variable de entorno en Netlify:
```
REACT_APP_WHATSAPP=51926915967
```

Opción 2 — editar directamente en `frontend/src/lib/api.js`:
```js
export const WA_NUMBER = process.env.REACT_APP_WHATSAPP || "51926915967";
```

---

## 🎨 Qué incluye

- ✅ Home con hero, bento categorías, destacados, editorial
- ✅ Catálogo con filtros (categoría, talla) y ordenamiento
- ✅ Detalle de producto con galería
- ✅ Carrito persistente (localStorage)
- ✅ Checkout que abre WhatsApp con el resumen del pedido
- ✅ 12 productos de ejemplo en 5 categorías

## ❌ Qué NO incluye (por diseño, al ser solo frontend)

- Panel admin (requiere backend)
- Base de datos de pedidos (los pedidos llegan directamente por WhatsApp)
- Gestión de stock en tiempo real

Si más adelante quieres sumar admin/backend, lo volvemos a conectar.
