import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { CATEGORIES } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navbar = () => {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setQ("");
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-brand-ink text-white text-xs tracking-widest uppercase py-2 text-center font-body" data-testid="announcement-bar">
        <span className="mx-4">Envío gratis en pedidos desde S/ 199</span>
        <span className="mx-4 hidden md:inline">·</span>
        <span className="mx-4 hidden md:inline">Nueva colección ya disponible</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-brand-line" data-testid="main-navbar">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger className="md:hidden" data-testid="mobile-menu-trigger">
                <Menu className="w-5 h-5 text-brand-ink" strokeWidth={1.5} />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-white">
                <div className="mt-8 flex flex-col gap-6">
                  <Link to="/" className="font-heading text-3xl text-brand-ink">Pop Up</Link>
                  <nav className="flex flex-col gap-4 text-sm uppercase tracking-widest">
                    <NavLink to="/shop" className="text-brand-ink hover:text-brand-accent">Todo</NavLink>
                    {CATEGORIES.map((c) => (
                      <NavLink key={c.slug} to={`/shop?category=${c.slug}`} className="text-brand-ink hover:text-brand-accent">
                        {c.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="font-heading text-2xl md:text-3xl tracking-tight text-brand-ink" data-testid="navbar-logo">
              Pop Up
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] font-body text-brand-ink" data-testid="desktop-nav">
              <NavLink to="/shop" className={({isActive}) => isActive ? "text-brand-accent" : "hover:text-brand-accent transition-colors"}>Todo</NavLink>
              {CATEGORIES.map((c) => (
                <NavLink
                  key={c.slug}
                  to={`/shop?category=${c.slug}`}
                  className={({isActive}) => isActive ? "text-brand-accent" : "hover:text-brand-accent transition-colors"}
                  data-testid={`nav-${c.slug}`}
                >
                  {c.label}
                </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4 md:gap-5">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="text-brand-ink hover:text-brand-accent transition-colors"
                data-testid="search-toggle"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <Link to="/admin/login" className="hidden md:block text-brand-ink hover:text-brand-accent transition-colors" data-testid="admin-link" aria-label="Admin">
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="relative text-brand-ink hover:text-brand-accent transition-colors"
                data-testid="cart-button"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-body" data-testid="cart-count">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <form onSubmit={onSearch} className="pb-4 fade-up" data-testid="search-form">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" strokeWidth={1.5} />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar prendas..."
                  className="w-full bg-brand-soft border border-brand-line rounded-full pl-12 pr-12 py-3 text-sm font-body focus:outline-none focus:border-brand-accent"
                  data-testid="search-input"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </form>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
