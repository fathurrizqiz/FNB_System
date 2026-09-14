import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* ---------------- data ---------------- */
const NAV_LINKS = [
    { label: 'Menu', href: '#menu' },
    { label: 'Cerita', href: '#cerita' },
    { label: 'Lokasi', href: '#lokasi' },
];

const SIGNATURE = [
    {
        no: '01',
        name: 'Es Kopi Senja',
        note: 'gula aren · susu segar · espresso',
        price: '28K',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    },
    {
        no: '02',
        name: 'V60 Gayo',
        note: 'manual brew · cokelat · jeruk',
        price: '38K',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    },
    {
        no: '03',
        name: 'Butter Croissant',
        note: 'dipanggang setiap pagi',
        price: '25K',
        img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    },
];

const MENU = [
    {
        id: 1,
        name: 'Es Kopi Senja',
        desc: 'Espresso · susu segar · gula aren',
        price: 28000,
        cat: 'Kopi',
        tag: 'Best Seller',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    },
    {
        id: 2,
        name: 'Flat White',
        desc: 'Double ristretto · microfoam',
        price: 32000,
        cat: 'Kopi',
        img: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80',
    },
    {
        id: 3,
        name: 'V60 Single Origin',
        desc: 'Gayo · cokelat · jeruk',
        price: 38000,
        cat: 'Manual Brew',
        tag: 'Baru',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    },
    {
        id: 4,
        name: 'Cold Brew 12 Jam',
        desc: 'Diseduh dingin · smooth',
        price: 30000,
        cat: 'Kopi',
        img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
    },
    {
        id: 5,
        name: 'Matcha Latte',
        desc: 'Uji matcha · oat milk',
        price: 35000,
        cat: 'Non-Kopi',
        img: 'https://images.unsplash.com/photo-1536010305525-f7aa0834e2c7?w=600&q=80',
    },
    {
        id: 6,
        name: 'Butter Croissant',
        desc: 'Dipanggang setiap pagi',
        price: 25000,
        cat: 'Pastry',
        img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    },
];

const CATS = ['Semua', 'Kopi', 'Manual Brew', 'Non-Kopi', 'Pastry'];

/* ---------------- helpers ---------------- */
function useReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVisible(true);
                    io.disconnect();
                }
            },
            { threshold },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return [ref, visible] as const;
}

function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}s, transform .9s cubic-bezier(.16,1,.3,1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

/* ---------------- page ---------------- */
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [cart, setCart] = useState<
        { id: number; name: string; price: number; img: string; qty: number }[]
    >([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cat, setCat] = useState('Semua');
    const [hoveredSig, setHoveredSig] = useState<string | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = cartOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [cartOpen]);

    const add = (item: (typeof MENU)[number]) =>
        setCart((c) => {
            const found = c.find((x) => x.id === item.id);
            return found
                ? c.map((x) =>
                      x.id === item.id ? { ...x, qty: x.qty + 1 } : x,
                  )
                : [
                      ...c,
                      {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          img: item.img,
                          qty: 1,
                      },
                  ];
        });

    const remove = (id: number) =>
        setCart((c) => c.filter((x) => x.id !== id));

    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
    const count = cart.reduce((s, x) => s + x.qty, 0);

    const filtered =
        cat === 'Semua' ? MENU : MENU.filter((m) => m.cat === cat);

    return (
        <>
            <Head title="Senja — Kopi & Ruang" />

            {/* grain overlay */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-[100] opacity-[.05] mix-blend-multiply"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            <div className="relative min-h-screen bg-cream font-sans text-ink selection:bg-terracotta selection:text-cream">
                {/* ================= NAV ================= */}
                <header
                    className={`fixed left-0 right-0 top-0 z-50 transition-all duration-700 ${
                        scrolled
                            ? 'border-b border-ink/10 bg-cream/80 py-3 backdrop-blur-md'
                            : 'bg-transparent py-6'
                    }`}
                >
                    <div className="mx-auto flex items-center justify-between px-6 md:px-10">
                        <Link
                            href="/"
                            className="font-display text-2xl tracking-tight"
                        >
                            Senja<span className="text-terracotta">.</span>
                        </Link>

                        <nav className="hidden items-center gap-10 md:flex">
                            {NAV_LINKS.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    className="group relative text-sm font-medium text-ink/70 transition hover:text-ink"
                                >
                                    {l.label}
                                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="hidden text-xs tracking-widest text-ink/50 lg:block">
                                BUKA · 08:00 — 22:00
                            </span>
                            <Link
                                href="/menu"
                                className="group relative overflow-hidden rounded-full bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-cream transition-colors"
                            >
                                <span className="relative z-10">
                                    Pesan Sekarang
                                </span>
                                <span className="absolute inset-0 z-0 translate-y-full bg-terracotta transition-transform duration-500 group-hover:translate-y-0" />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ================= HERO ================= */}
                <section className="relative overflow-hidden pt-32 md:pt-40">
                    <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-terracotta/8 blur-3xl" />

                    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
                        <div className="grid grid-cols-12 items-end gap-8">
                            {/* left */}
                            <div className="col-span-12 lg:col-span-7">
                                <Reveal>
                                    <p className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink/50">
                                        <span className="h-px w-8 bg-ink/30" />
                                        Est. 2019 — Bandung
                                    </p>
                                </Reveal>

                                <Reveal delay={0.1}>
                                    <h1 className="font-display text-[clamp(2.75rem,8vw,7rem)] font-normal leading-[0.95] tracking-[-0.02em]">
                                        Kopi yang diseduh
                                        <br />
                                        dengan{' '}
                                        <em className="italic text-terracotta">
                                            kesabaran
                                        </em>
                                        ,
                                        <br />
                                        disajikan dengan{' '}
                                        <em className="italic">cerita</em>.
                                    </h1>
                                </Reveal>

                                <Reveal delay={0.2}>
                                    <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/65">
                                        Kami memilih biji dari petani kecil di
                                        Gayo, Toraja, dan Kintamani. Setiap
                                        cangkir adalah hasil dari proses yang
                                        tidak pernah kami buru-buru.
                                    </p>
                                </Reveal>

                                <Reveal delay={0.3}>
                                    <div className="mt-10 flex flex-wrap items-center gap-6">
                                        <a
                                            href="#menu"
                                            className="group inline-flex items-center gap-3 text-sm font-medium"
                                        >
                                            <span className="relative grid h-12 w-12 place-items-center rounded-full border border-ink/20 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        d="M5 12h14M13 6l6 6-6 6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>
                                            <span>Lihat menu lengkap</span>
                                        </a>

                                        <div className="flex items-center gap-3 text-sm text-ink/60">
                                            <div className="flex -space-x-2">
                                                {[
                                                    '#3F8E7C',
                                                    '#34D399',
                                                    '#064E3B',
                                                ].map((c, i) => (
                                                    <span
                                                        key={i}
                                                        className="h-6 w-6 rounded-full border-2 border-cream"
                                                        style={{
                                                            background: c,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span>4.9 · 1.2k ulasan</span>
                                        </div>
                                    </div>
                                </Reveal>
                            </div>

                            {/* right — overlapping images */}
                            <div className="col-span-12 lg:col-span-5">
                                <Reveal delay={0.25}>
                                    <div className="relative mx-auto max-w-[420px] lg:ml-auto">
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                                            <img
                                                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80"
                                                alt="Interior Senja"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="absolute -bottom-10 -left-10 hidden aspect-square w-40 overflow-hidden rounded-sm border-[6px] border-cream md:block lg:w-52">
                                            <img
                                                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                                                alt="Espresso"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* floating badge */}
                                        <div className="absolute -right-4 top-8 flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 text-xs font-medium shadow-[0_10px_30px_-10px_rgba(0,0,0,.25)] backdrop-blur">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
                                            </span>
                                            Sedang buka
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>

                        {/* bottom stats strip */}
                        <Reveal delay={0.4}>
                            <div className="mt-24 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8 md:grid-cols-4 md:gap-12">
                                {[
                                    ['06', 'Single origin pilihan'],
                                    ['12h', 'Cold brew slow-drip'],
                                    ['100%', 'Biji dari petani lokal'],
                                    ['1.2k', 'Pelanggan setia'],
                                ].map(([n, l]) => (
                                    <div key={l}>
                                        <p className="font-display text-4xl leading-none">
                                            {n}
                                        </p>
                                        <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                                            {l}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ================= MARQUEE ================= */}
                <section className="mt-32 overflow-hidden border-y border-ink/10 py-6">
                    <div className="flex animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap will-change-transform">
                        {[0, 1].map((k) => (
                            <div
                                key={k}
                                className="flex shrink-0 items-center gap-12"
                            >
                                {[
                                    'SINGLE ORIGIN',
                                    'MANUAL BREW',
                                    'HOMEMADE PASTRY',
                                    'SLOW BAR',
                                    'NO RUSH',
                                    'SEASONAL BLEND',
                                ].map((t) => (
                                    <span
                                        key={t}
                                        className="flex items-center gap-12 font-display text-3xl text-ink/30 md:text-4xl"
                                    >
                                        {t}
                                        <span className="text-terracotta">
                                            ✦
                                        </span>
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                    <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
                </section>

                {/* ================= SIGNATURE ================= */}
                <section id="cerita" className="py-32 md:py-40">
                    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
                        <Reveal>
                            <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
                                <div>
                                    <p className="mb-4 text-xs uppercase tracking-[0.25em] text-ink/50">
                                        / Tanda tangan kami
                                    </p>
                                    <h2 className="font-display text-5xl leading-[1.05] md:text-6xl">
                                        Tiga hal yang{' '}
                                        <em className="italic">paling</em>
                                        <br />
                                        sering dipesan.
                                    </h2>
                                </div>
                                <p className="max-w-xs text-sm leading-relaxed text-ink/60">
                                    Kalau ini kunjungan pertama, mulai dari
                                    salah satu dari tiga ini.
                                </p>
                            </div>
                        </Reveal>

                        <div className="divide-y divide-ink/10 border-y border-ink/10">
                            {SIGNATURE.map((s, i) => (
                                <Reveal key={s.no} delay={i * 0.08}>
                                    <div
                                        className="group relative flex items-center justify-between gap-6 py-8 md:py-10"
                                        onMouseEnter={() =>
                                            setHoveredSig(s.no)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredSig(null)
                                        }
                                    >
                                        <span className="w-12 font-display text-lg text-ink/30">
                                            {s.no}
                                        </span>

                                        <div className="flex-1">
                                            <h3 className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">
                                                {s.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-ink/50">
                                                {s.note}
                                            </p>
                                        </div>

                                        <span className="font-display text-2xl text-terracotta">
                                            {s.price}
                                        </span>

                                        <div
                                            className={`pointer-events-none absolute right-32 top-1/2 hidden h-40 w-40 -translate-y-1/2 overflow-hidden rounded-sm shadow-xl transition-all duration-500 md:block ${
                                                hoveredSig === s.no
                                                    ? 'scale-100 opacity-100'
                                                    : 'scale-90 opacity-0'
                                            }`}
                                        >
                                            <img
                                                src={s.img}
                                                alt={s.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= MENU / ORDER ================= */}
                <section
                    id="menu"
                    className="bg-ink py-32 text-cream md:py-40"
                >
                    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
                        <Reveal>
                            <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
                                <div>
                                    <p className="mb-4 text-xs uppercase tracking-[0.25em] text-cream/50">
                                        / Menu
                                    </p>
                                    <h2 className="font-display text-5xl leading-[1.05] md:text-6xl">
                                        Pilih, tambah,{' '}
                                        <em className="italic">nikmati</em>.
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {CATS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCat(c)}
                                            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 ${
                                                cat === c
                                                    ? 'border-cream bg-cream text-ink'
                                                    : 'border-cream/25 text-cream/70 hover:border-cream/60 hover:text-cream'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((item, i) => (
                                <Reveal key={item.id} delay={i * 0.06}>
                                    <article className="group">
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink/40">
                                            <img
                                                src={item.img}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                                            />

                                            {item.tag && (
                                                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink">
                                                    {item.tag}
                                                </span>
                                            )}

                                            <button
                                                onClick={() => add(item)}
                                                className="absolute bottom-4 right-4 grid h-12 w-12 translate-y-2 place-items-center rounded-full bg-cream text-ink opacity-0 transition-all duration-500 hover:bg-terracotta hover:text-cream group-hover:translate-y-0 group-hover:opacity-100"
                                                aria-label={`Tambah ${item.name}`}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        d="M12 5v14M5 12h14"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="mt-5 flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-display text-2xl">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-cream/55">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <span className="whitespace-nowrap font-display text-lg text-sage">
                                                {rupiah(item.price)}
                                            </span>
                                        </div>
                                    </article>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= LOKASI ================= */}
                <section id="lokasi" className="py-32 md:py-40">
                    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
                        <div className="grid grid-cols-12 gap-10">
                            <Reveal className="col-span-12 lg:col-span-5">
                                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-ink/50">
                                    / Kunjungi
                                </p>
                                <h2 className="font-display text-5xl leading-[1.05] md:text-6xl">
                                    Mampir, duduk,
                                    <br />
                                    <em className="italic">
                                        tinggal lebih lama
                                    </em>
                                    .
                                </h2>

                                <div className="mt-10 space-y-6 text-sm">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-ink/40">
                                            Alamat
                                        </p>
                                        <p className="mt-1 leading-relaxed">
                                            Jl. Braga No. 88, Sumur Bandung
                                            <br />
                                            Kota Bandung, Jawa Barat 40111
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-ink/40">
                                            Jam Buka
                                        </p>
                                        <p className="mt-1">
                                            Senin — Kamis · 08:00 – 22:00
                                        </p>
                                        <p>
                                            Jumat — Minggu · 08:00 – 24:00
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-ink/40">
                                            Kontak
                                        </p>
                                        <p className="mt-1">
                                            +62 812 3456 7890 ·
                                            hello@senja.id
                                        </p>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal
                                delay={0.15}
                                className="col-span-12 lg:col-span-7"
                            >
                                <div className="relative aspect-[5/4] overflow-hidden rounded-sm">
                                    <img
                                        src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80"
                                        alt="Lokasi Senja"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute bottom-6 left-6 rounded-sm bg-cream/95 px-5 py-3 backdrop-blur">
                                        <p className="text-xs uppercase tracking-widest text-ink/50">
                                            Senja Coffee
                                        </p>
                                        <p className="mt-1 font-display text-lg">
                                            Braga, Bandung
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ================= FOOTER ================= */}
                <footer className="border-t border-ink/10 bg-cream">
                    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 md:col-span-6">
                                <p className="font-display text-[clamp(3rem,10vw,8rem)] leading-none tracking-tight">
                                    Senja
                                    <span className="text-terracotta">.</span>
                                </p>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <p className="mb-4 text-xs uppercase tracking-widest text-ink/40">
                                    Jelajahi
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a
                                            href="#menu"
                                            className="hover:text-terracotta"
                                        >
                                            Menu
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#cerita"
                                            className="hover:text-terracotta"
                                        >
                                            Cerita
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#lokasi"
                                            className="hover:text-terracotta"
                                        >
                                            Lokasi
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <p className="mb-4 text-xs uppercase tracking-widest text-ink/40">
                                    Sosial
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-terracotta"
                                        >
                                            Instagram
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-terracotta"
                                        >
                                            TikTok
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-terracotta"
                                        >
                                            WhatsApp
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <p className="mb-4 text-xs uppercase tracking-widest text-ink/40">
                                    Newsletter
                                </p>
                                <form className="flex items-center gap-2 border-b border-ink/20 pb-2">
                                    <input
                                        type="email"
                                        placeholder="email@kamu.com"
                                        className="w-full bg-transparent text-sm placeholder:text-ink/30 focus:outline-none"
                                    />
                                    <button className="text-xs uppercase tracking-widest hover:text-terracotta">
                                        Kirim
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-ink/40">
                            <p>
                                © {new Date().getFullYear()} Senja Coffee.
                                Semua hak cipta dilindungi.
                            </p>
                            <p>Dibuat dengan tenang di Bandung.</p>
                        </div>
                    </div>
                </footer>

                {/* ================= FLOATING CART ================= */}
                {count > 0 && !cartOpen && (
                    <button
                        onClick={() => setCartOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-cream shadow-2xl transition-all duration-500 hover:bg-terracotta"
                        style={{
                            animation: 'pop .4s cubic-bezier(.16,1,.3,1)',
                        }}
                    >
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-cream text-xs font-semibold text-ink">
                            {count}
                        </span>
                        <span className="text-sm font-medium">
                            {rupiah(total)}
                        </span>
                        <span className="text-xs uppercase tracking-widest">
                            Lihat
                        </span>
                    </button>
                )}

                {/* ================= CART DRAWER ================= */}
                <div
                    className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
                        cartOpen
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                >
                    <div
                        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        onClick={() => setCartOpen(false)}
                    />
                    <aside
                        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                            cartOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-ink/40">
                                    Pesanan kamu
                                </p>
                                <p className="mt-1 font-display text-2xl">
                                    {count} item
                                </p>
                            </div>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-cream"
                                aria-label="Tutup"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        d="M6 6l12 12M18 6L6 18"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {cart.length === 0 ? (
                                <p className="mt-10 text-center text-sm text-ink/50">
                                    Keranjang masih kosong.
                                </p>
                            ) : (
                                <ul className="divide-y divide-ink/10">
                                    {cart.map((x) => (
                                        <li
                                            key={x.id}
                                            className="flex items-center gap-4 py-4"
                                        >
                                            <img
                                                src={x.img}
                                                alt={x.name}
                                                className="h-16 w-16 rounded-sm object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-display text-lg leading-tight">
                                                    {x.name}
                                                </p>
                                                <p className="text-xs text-ink/50">
                                                    {rupiah(x.price)} × {x.qty}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => remove(x.id)}
                                                className="text-xs uppercase tracking-widest text-ink/40 hover:text-terracotta"
                                            >
                                                Hapus
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="border-t border-ink/10 px-6 py-6">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm text-ink/60">
                                    Total
                                </span>
                                <span className="font-display text-3xl">
                                    {rupiah(total)}
                                </span>
                            </div>
                            <button
                                disabled={cart.length === 0}
                                className="w-full rounded-full bg-ink py-4 text-sm font-medium uppercase tracking-widest text-cream transition hover:bg-terracotta disabled:opacity-40"
                            >
                                Lanjut ke pesanan
                            </button>
                            <p className="mt-3 text-center text-[11px] text-ink/40">
                                Bayar di kasir atau transfer — kamu akan
                                diarahkan ke halaman konfirmasi.
                            </p>
                        </div>
                    </aside>
                </div>

                <style>{`@keyframes pop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
            </div>
        </>
    );
}