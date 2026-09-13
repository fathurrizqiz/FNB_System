import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

/* ---------------- types ---------------- */
interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number | string;
    image: string | null;
    category?: string | null;
}

interface CartLine extends MenuItem {
    qty: number;
}

interface PageProps {
    menu: MenuItem[];
}

const rupiah = (n: number | string) =>
    "Rp " + Number(n).toLocaleString("id-ID");

const CART_KEY = "senja.cart.v1";

/* ---------------- component ---------------- */
export default function MenuPage({ menu }: PageProps) {
    const [cart, setCart] = useState<CartLine[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [activeCat, setActiveCat] = useState<string>("Semua");
    const [justAdded, setJustAdded] = useState<number | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CART_KEY);
            if (raw) setCart(JSON.parse(raw));
        } catch {}
    }, []);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        document.body.style.overflow = cartOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [cartOpen]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        menu.forEach((m) => m.category && set.add(m.category));
        return ["Semua", ...Array.from(set)];
    }, [menu]);

    const filtered = useMemo(
        () =>
            activeCat === "Semua"
                ? menu
                : menu.filter((m) => m.category === activeCat),
        [menu, activeCat],
    );

    const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);
    const count = cart.reduce((s, x) => s + x.qty, 0);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const found = prev.find((x) => x.id === item.id);
            if (found)
                return prev.map((x) =>
                    x.id === item.id ? { ...x, qty: x.qty + 1 } : x,
                );
            return [...prev, { ...item, qty: 1 }];
        });
        setJustAdded(item.id);
        window.setTimeout(() => setJustAdded(null), 800);
    };

    const decrement = (id: number) =>
        setCart((prev) =>
            prev
                .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
                .filter((x) => x.qty > 0),
        );

    const increment = (id: number) =>
        setCart((prev) =>
            prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
        );

    const removeLine = (id: number) =>
        setCart((prev) => prev.filter((x) => x.id !== id));

    const clearCart = () => setCart([]);

    const checkout = () => {
        if (cart.length === 0) return;
        alert("Lanjut ke halaman checkout (belum diimplementasi).");
    };

    return (
        <>
            <Head title="Menu — Senja" />

            <div className="min-h-screen bg-[#F4EFE6] font-sans text-[#171310] selection:bg-[#C25A2A] selection:text-[#F4EFE6]">
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0 opacity-[.035] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />

                <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-16">
                    {/* HEADER */}
                    <header className="mb-10 md:mb-14">
                        <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[#171310]/50">
                            <span className="h-px w-6 bg-[#171310]/30" />
                            Menu Kami
                        </p>

                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.02em]">
                                Pilih, tambah,{" "}
                                <em className="italic text-[#C25A2A]">
                                    nikmati
                                </em>
                                .
                            </h1>

                            <p className="max-w-xs text-xs leading-relaxed text-[#171310]/60 md:text-sm">
                                Semua pilihanmu masuk ke keranjang. Checkout
                                kapan saja — tanpa login.
                            </p>
                        </div>
                    </header>

                    {/* FILTER */}
                    <div className="mb-8 flex flex-wrap gap-2 border-b border-[#171310]/10 pb-4">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setActiveCat(c)}
                                className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all duration-300 md:px-4 md:text-xs ${
                                    activeCat === c
                                        ? "border-[#171310] bg-[#171310] text-[#F4EFE6]"
                                        : "border-[#171310]/20 text-[#171310]/70 hover:border-[#171310]/60 hover:text-[#171310]"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* GRID — 2 kolom mobile, 3 tablet, 4 desktop */}
                    {filtered.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:gap-x-5 md:gap-y-8 lg:grid-cols-4">
                            {filtered.map((item, i) => (
                                <MenuCard
                                    key={item.id}
                                    item={item}
                                    index={i}
                                    qtyInCart={
                                        cart.find((x) => x.id === item.id)
                                            ?.qty ?? 0
                                    }
                                    justAdded={justAdded === item.id}
                                    onAdd={() => addToCart(item)}
                                    onIncrement={() => increment(item.id)}
                                    onDecrement={() => decrement(item.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* FLOATING CART BUTTON */}
                {count > 0 && (
                    <button
                        onClick={() => setCartOpen(true)}
                        className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full bg-[#171310] py-2.5 pl-2.5 pr-4 text-[#F4EFE6] shadow-2xl transition-all duration-500 hover:bg-[#C25A2A] md:bottom-6 md:right-6"
                        style={{
                            animation: "pop .4s cubic-bezier(.16,1,.3,1)",
                        }}
                    >
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4EFE6] text-[11px] font-semibold text-[#171310]">
                            {count}
                        </span>
                        <span className="flex flex-col items-start leading-tight">
                            <span className="text-[9px] uppercase tracking-widest opacity-60">
                                Keranjang
                            </span>
                            <span className="font-serif text-sm md:text-base">
                                {rupiah(total)}
                            </span>
                        </span>
                    </button>
                )}

                {/* CART DRAWER */}
                <CartDrawer
                    open={cartOpen}
                    cart={cart}
                    total={total}
                    onClose={() => setCartOpen(false)}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onRemove={removeLine}
                    onClear={clearCart}
                    onCheckout={checkout}
                />
            </div>

            <style>{`
                @keyframes pop {
                    from { transform: scale(.85); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

/* ============================================================
   Menu Card — Compact
============================================================ */
function MenuCard({
    item,
    index,
    qtyInCart,
    justAdded,
    onAdd,
    onIncrement,
    onDecrement,
}: {
    item: MenuItem;
    index: number;
    qtyInCart: number;
    justAdded: boolean;
    onAdd: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
}) {
    return (
        <article
            className="group flex flex-col"
            style={{
                animation: `fadeUp .6s cubic-bezier(.16,1,.3,1) ${index * 0.03}s both`,
            }}
        >
            {/* Image — square */}
            <div className="relative aspect-square overflow-hidden bg-[#171310]/5">
                {item.image ? (
                    <img
                        src={`/storage/${item.image}`}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-[#171310]/30">
                        No Image
                    </div>
                )}

                {/* number */}
                <span className="absolute left-2.5 top-2.5 font-serif text-[11px] italic text-[#F4EFE6] mix-blend-difference">
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* hover add */}
                {qtyInCart === 0 && (
                    <button
                        onClick={onAdd}
                        className="absolute bottom-2.5 right-2.5 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-[#F4EFE6] text-[#171310] opacity-0 shadow-md transition-all duration-400 hover:bg-[#C25A2A] hover:text-[#F4EFE6] group-hover:translate-y-0 group-hover:opacity-100"
                        aria-label={`Tambah ${item.name}`}
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 5v14M5 12h14"
                            />
                        </svg>
                    </button>
                )}

                {/* just-added */}
                {justAdded && (
                    <div className="absolute inset-0 grid place-items-center bg-[#171310]/40 backdrop-blur-sm">
                        <span
                            className="rounded-full bg-[#F4EFE6] px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-[#171310]"
                            style={{
                                animation:
                                    "pop .3s cubic-bezier(.16,1,.3,1)",
                            }}
                        >
                            ✓
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="mt-2.5 flex flex-1 flex-col md:mt-3">
                <h3 className="font-serif text-sm leading-tight tracking-[-0.01em] md:text-base">
                    {item.name}
                </h3>

                {item.description && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-[#171310]/50 md:text-xs">
                        {item.description}
                    </p>
                )}

                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="font-serif text-sm text-[#C25A2A] md:text-base">
                        {rupiah(item.price)}
                    </span>
                </div>

                {/* Actions */}
                <div className="mt-auto border-t border-[#171310]/10 pt-2.5 md:pt-3">
                    {qtyInCart === 0 ? (
                        <button
                            onClick={onAdd}
                            className="group/btn flex w-full items-center justify-between text-[10px] font-medium uppercase tracking-widest text-[#171310]/70 transition-colors hover:text-[#171310] md:text-[11px]"
                        >
                            <span className="relative">
                                Tambah
                                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#171310] transition-all duration-300 group-hover/btn:w-full" />
                            </span>
                            <svg
                                className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12h14M13 6l6 6-6 6"
                                />
                            </svg>
                        </button>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 rounded-full border border-[#171310]/15 px-0.5 py-0.5">
                                <button
                                    onClick={onDecrement}
                                    className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-[#171310] hover:text-[#F4EFE6]"
                                    aria-label="Kurangi"
                                >
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            d="M5 12h14"
                                        />
                                    </svg>
                                </button>

                                <span className="w-5 text-center font-serif text-xs">
                                    {qtyInCart}
                                </span>

                                <button
                                    onClick={onIncrement}
                                    className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-[#171310] hover:text-[#F4EFE6]"
                                    aria-label="Tambah"
                                >
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            d="M12 5v14M5 12h14"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <span className="hidden text-[9px] uppercase tracking-widest text-[#6B7250] sm:block">
                                Ditambah
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

/* ============================================================
   Cart Drawer (tetap sama seperti sebelumnya)
============================================================ */
function CartDrawer({
    open,
    cart,
    total,
    onClose,
    onIncrement,
    onDecrement,
    onRemove,
    onClear,
    onCheckout,
}: {
    open: boolean;
    cart: CartLine[];
    total: number;
    onClose: () => void;
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
    onRemove: (id: number) => void;
    onClear: () => void;
    onCheckout: () => void;
}) {
    const count = cart.reduce((s, x) => s + x.qty, 0);

    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity duration-300 ${
                open
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!open}
        >
            <div
                className="absolute inset-0 bg-[#171310]/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside
                className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#F4EFE6] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-[#171310]/10 px-6 py-5">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#171310]/40">
                            Pesanan kamu
                        </p>
                        <p className="mt-1 font-serif text-2xl">
                            {count} item
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="grid h-10 w-10 place-items-center rounded-full border border-[#171310]/15 transition hover:bg-[#171310] hover:text-[#F4EFE6]"
                        aria-label="Tutup"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                d="M6 6l12 12M18 6L6 18"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {cart.length === 0 ? (
                        <div className="mt-16 text-center">
                            <p className="font-serif text-2xl italic text-[#171310]/40">
                                Keranjang masih kosong.
                            </p>
                            <p className="mt-2 text-sm text-[#171310]/50">
                                Tambah sesuatu dulu, yuk.
                            </p>
                        </div>
                    ) : (
                        <>
                            <ul className="divide-y divide-[#171310]/10">
                                {cart.map((line) => (
                                    <li
                                        key={line.id}
                                        className="flex gap-4 py-4"
                                    >
                                        <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#171310]/5">
                                            {line.image ? (
                                                <img
                                                    src={`/storage/${line.image}`}
                                                    alt={line.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="truncate font-serif text-lg leading-tight">
                                                    {line.name}
                                                </h4>
                                                <button
                                                    onClick={() =>
                                                        onRemove(line.id)
                                                    }
                                                    className="text-[10px] uppercase tracking-widest text-[#171310]/40 transition-colors hover:text-[#C25A2A]"
                                                >
                                                    Hapus
                                                </button>
                                            </div>

                                            <p className="mt-1 text-xs text-[#171310]/50">
                                                {rupiah(line.price)}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between pt-3">
                                                <div className="flex items-center gap-3 rounded-full border border-[#171310]/15 px-1 py-0.5">
                                                    <button
                                                        onClick={() =>
                                                            onDecrement(
                                                                line.id,
                                                            )
                                                        }
                                                        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#171310] hover:text-[#F4EFE6]"
                                                        aria-label="Kurangi"
                                                    >
                                                        <svg
                                                            className="h-3 w-3"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                d="M5 12h14"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <span className="w-5 text-center font-serif text-base">
                                                        {line.qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            onIncrement(
                                                                line.id,
                                                            )
                                                        }
                                                        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#171310] hover:text-[#F4EFE6]"
                                                        aria-label="Tambah"
                                                    >
                                                        <svg
                                                            className="h-3 w-3"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                d="M12 5v14M5 12h14"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <span className="font-serif text-base">
                                                    {rupiah(
                                                        Number(line.price) *
                                                            line.qty,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={onClear}
                                className="mt-6 text-xs uppercase tracking-widest text-[#171310]/40 transition-colors hover:text-[#C25A2A]"
                            >
                                Kosongkan keranjang
                            </button>
                        </>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="border-t border-[#171310]/10 px-6 py-6">
                        <div className="mb-5 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#171310]/60">
                                    Subtotal
                                </span>
                                <span className="font-mono">
                                    {rupiah(total)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#171310]/60">
                                    Biaya layanan
                                </span>
                                <span className="font-mono text-[#171310]/40">
                                    Dihitung saat checkout
                                </span>
                            </div>
                        </div>

                        <div className="mb-5 flex items-end justify-between border-t border-[#171310]/10 pt-4">
                            <span className="text-xs uppercase tracking-widest text-[#171310]/50">
                                Total
                            </span>
                            <span className="font-serif text-3xl">
                                {rupiah(total)}
                            </span>
                        </div>

                        <button
                            onClick={onCheckout}
                            className="group relative w-full overflow-hidden rounded-full bg-[#171310] py-4 text-xs font-medium uppercase tracking-widest text-[#F4EFE6] transition-colors"
                        >
                            <span className="relative z-10">
                                Lanjut ke checkout
                            </span>
                            <span className="absolute inset-0 z-0 translate-y-full bg-[#C25A2A] transition-transform duration-500 group-hover:translate-y-0" />
                        </button>

                        <p className="mt-3 text-center text-[11px] text-[#171310]/40">
                            Tidak perlu login. Bayar di kasir atau transfer.
                        </p>
                    </div>
                )}
            </aside>
        </div>
    );
}

/* ============================================================
   Empty State
============================================================ */
function EmptyState() {
    return (
        <div className="border border-dashed border-[#171310]/15 py-16 text-center">
            <p className="mb-2 font-serif text-2xl italic text-[#171310]/40">
                Belum ada menu untuk kategori ini.
            </p>
            <p className="text-sm text-[#171310]/50">
                Coba pilih kategori lain.
            </p>
        </div>
    );
}