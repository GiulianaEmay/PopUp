import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ShoppingBag, LogOut, X } from "lucide-react";
import api, { formatPrice, CATEGORIES, getCategoryLabel } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

const emptyForm = {
  name: "", description: "", price: "", category: "vestidos",
  sizes: ["S", "M", "L"], images: [""], stock: 10, featured: false, is_new: false,
};

const AdminDashboard = () => {
  const { user, logout, checking } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const [p, o] = await Promise.all([
        api.get("/products", { params: { limit: 200 } }),
        api.get("/orders"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (checking) return <div className="p-10 text-brand-muted font-body">Cargando...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const onLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price,
      category: p.category, sizes: p.sizes, images: p.images.length ? p.images : [""],
      stock: p.stock, featured: p.featured, is_new: p.is_new,
    });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      images: form.images.filter((x) => x.trim()),
    };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success("Producto actualizado");
      } else {
        await api.post("/products", payload);
        toast.success("Producto creado");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar");
    }
  };

  const remove = async (p) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success("Producto eliminado");
      load();
    } catch { toast.error("Error al eliminar"); }
  };

  const updateOrder = async (o, status) => {
    try {
      await api.patch(`/orders/${o.id}`, { status });
      toast.success("Estado actualizado");
      load();
    } catch { toast.error("Error al actualizar"); }
  };

  const toggleSize = (s) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));
  };

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-brand-soft" data-testid="admin-dashboard">
      {/* Top bar */}
      <div className="bg-white border-b border-brand-line sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading text-2xl text-brand-ink">Pop Up · <span className="text-brand-accent text-base">Admin</span></Link>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-brand-muted hidden md:inline">{user.email}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm font-body text-brand-ink hover:text-brand-accent" data-testid="admin-logout">
              <LogOut className="w-4 h-4" strokeWidth={1.5} /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <StatCard label="Productos" value={products.length} icon={<Package className="w-5 h-5" strokeWidth={1.5} />} />
          <StatCard label="Pedidos" value={orders.length} icon={<ShoppingBag className="w-5 h-5" strokeWidth={1.5} />} />
          <StatCard label="Ingresos" value={formatPrice(totalRevenue)} icon={<Package className="w-5 h-5" strokeWidth={1.5} />} />
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-8 bg-white rounded-full p-1.5 border border-brand-line">
            <TabsTrigger value="products" className="rounded-full px-6 data-[state=active]:bg-brand-ink data-[state=active]:text-white" data-testid="tab-products">Productos</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full px-6 data-[state=active]:bg-brand-ink data-[state=active]:text-white" data-testid="tab-orders">Pedidos</TabsTrigger>
          </TabsList>

          {/* Products tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-3xl text-brand-ink">Productos</h2>
              <button onClick={openCreate} className="bg-brand-ink text-white hover:bg-brand-accent transition-colors rounded-full px-6 py-3 text-xs uppercase tracking-widest font-body inline-flex items-center gap-2" data-testid="create-product-btn">
                <Plus className="w-4 h-4" strokeWidth={1.5} /> Nuevo
              </button>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-brand-line">
              <table className="w-full">
                <thead className="bg-brand-soft">
                  <tr className="text-left font-body text-xs uppercase tracking-widest text-brand-muted">
                    <th className="p-4">Producto</th>
                    <th className="p-4 hidden md:table-cell">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 hidden md:table-cell">Stock</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-brand-line" data-testid={`admin-product-row-${p.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-12 h-16 object-cover rounded-lg" />}
                          <div>
                            <p className="font-body text-sm text-brand-ink">{p.name}</p>
                            <p className="font-body text-xs text-brand-muted md:hidden">{getCategoryLabel(p.category)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell font-body text-sm text-brand-muted">{getCategoryLabel(p.category)}</td>
                      <td className="p-4 font-body text-sm text-brand-ink">{formatPrice(p.price)}</td>
                      <td className="p-4 hidden md:table-cell font-body text-sm text-brand-muted">{p.stock}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="w-9 h-9 rounded-full border border-brand-line hover:border-brand-accent text-brand-ink hover:text-brand-accent flex items-center justify-center" data-testid={`edit-product-${p.id}`}>
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => remove(p)} className="w-9 h-9 rounded-full border border-brand-line hover:border-red-500 text-brand-ink hover:text-red-500 flex items-center justify-center" data-testid={`delete-product-${p.id}`}>
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && !loading && (
                <p className="text-center py-10 font-body text-sm text-brand-muted">No hay productos.</p>
              )}
            </div>
          </TabsContent>

          {/* Orders tab */}
          <TabsContent value="orders">
            <h2 className="font-heading text-3xl text-brand-ink mb-6">Pedidos</h2>
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-3xl border border-brand-line p-5 md:p-6" data-testid={`admin-order-${o.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-body text-xs uppercase tracking-widest text-brand-muted">Pedido {o.id.slice(0, 8).toUpperCase()}</p>
                      <h3 className="font-heading text-2xl text-brand-ink mt-1">{o.customer_name}</h3>
                      <p className="font-body text-xs text-brand-muted">{o.email} · {o.phone}</p>
                      <p className="font-body text-xs text-brand-muted mt-1">{o.address}, {o.city} {o.district}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-2xl text-brand-ink">{formatPrice(o.total)}</p>
                      <p className="font-body text-xs text-brand-muted">{new Date(o.created_at).toLocaleDateString("es-PE")}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {o.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between font-body text-sm text-brand-ink">
                        <span>{it.name} · T:{it.size} · x{it.quantity}</span>
                        <span>{formatPrice(it.price * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-brand-line">
                    <span className="font-body text-xs uppercase tracking-widest text-brand-muted mr-2">Estado</span>
                    {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateOrder(o, s)}
                        className={`text-xs px-4 py-2 rounded-full font-body transition-colors ${o.status === s ? "bg-brand-ink text-white" : "bg-brand-soft text-brand-ink hover:bg-brand"}`}
                        data-testid={`order-status-${o.id}-${s}`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {orders.length === 0 && !loading && (
                <div className="bg-white rounded-3xl border border-brand-line p-10 text-center font-body text-sm text-brand-muted">
                  Aún no hay pedidos.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl text-brand-ink">{editing ? "Editar" : "Nuevo"} producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <AdminField label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="form-product-name" />
            <AdminField label="Descripción" multiline value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required data-testid="form-product-desc" />
            <div className="grid md:grid-cols-2 gap-4">
              <AdminField label="Precio (S/)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required data-testid="form-product-price" />
              <AdminField label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required data-testid="form-product-stock" />
            </div>
            <label className="block">
              <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">Categoría</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white border border-brand-line rounded-full px-5 py-3 font-body text-sm" data-testid="form-product-category">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </label>
            <div>
              <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">Tallas</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((s) => (
                  <button
                    type="button" key={s} onClick={() => toggleSize(s)}
                    className={`w-11 h-11 rounded-full border font-body text-sm transition-all ${form.sizes.includes(s) ? "bg-brand-ink text-white border-brand-ink" : "bg-white text-brand-ink border-brand-line"}`}
                    data-testid={`form-size-${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">Imágenes (URLs)</span>
              <div className="space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={img}
                      onChange={(e) => { const next = [...form.images]; next[i] = e.target.value; setForm({ ...form, images: next }); }}
                      placeholder="https://..."
                      className="flex-1 bg-white border border-brand-line rounded-full px-5 py-3 font-body text-sm"
                      data-testid={`form-image-${i}`}
                    />
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="w-11 h-11 rounded-full border border-brand-line flex items-center justify-center text-brand-ink hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ""] })} className="text-xs font-body text-brand-accent hover:underline">
                  + Agregar imagen
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 font-body text-sm text-brand-ink">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="form-featured" />
                Destacado
              </label>
              <label className="flex items-center gap-2 font-body text-sm text-brand-ink">
                <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} data-testid="form-new" />
                Nuevo
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 border border-brand-line text-brand-ink rounded-full py-3 text-xs uppercase tracking-widest font-body hover:bg-brand-soft">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-brand-ink text-white rounded-full py-3 text-xs uppercase tracking-widest font-body hover:bg-brand-accent" data-testid="form-product-save">
                Guardar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const STATUS_LABEL = {
  pending: "Pendiente", confirmed: "Confirmado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado",
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-3xl p-5 border border-brand-line flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-brand-ink">{icon}</div>
    <div>
      <p className="font-body text-xs uppercase tracking-widest text-brand-muted">{label}</p>
      <p className="font-heading text-2xl text-brand-ink">{value}</p>
    </div>
  </div>
);

const AdminField = ({ label, multiline, ...props }) => (
  <label className="block">
    <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">{label}</span>
    {multiline ? (
      <textarea rows={3} {...props} className="w-full bg-white border border-brand-line rounded-2xl px-4 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent" />
    ) : (
      <input {...props} className="w-full bg-white border border-brand-line rounded-full px-5 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent" />
    )}
  </label>
);

export default AdminDashboard;
