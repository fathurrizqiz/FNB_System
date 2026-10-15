import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { view as evaluasiPage } from '@/routes/evaluasi';
import { order as createOrder } from '@/routes/menu';

/* ============================================================
   TYPES
============================================================ */
interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number | string;
    image: string | null;
}

interface Evaluation {
    id: number;
    name: string;
    comment: string;
}

interface OrderForm {
    customer_name: string;
    whatsapp_number: string;
    items: { menu_id: number; quantity: number }[];
    delivery_method: string;
    notes: string;
}

interface PageProps {
    menuItems: MenuItem[];
    comments: Evaluation[];
}

const SHOPEE_URL = 'https://shopee.co.id/product/646511096/54968378757/';

/* ============================================================
   COMPONENT
============================================================ */
export default function LandingPage({ menuItems, comments }: PageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const form = useForm<OrderForm>({
        customer_name: '',
        whatsapp_number: '',
        items: [{ menu_id: menuItems[0]?.id ?? 0, quantity: 1 }],
        delivery_method: 'Takeaway / Ambil Sendiri',
        notes: '',
    });

    /* scroll state */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* lock body scroll */
    useEffect(() => {
        document.body.style.overflow = modalOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [modalOpen]);

    /* computed */
    const selectedMenuId = form.data.items[0]?.menu_id;
    const selectedItem = menuItems.find((item) => item.id === selectedMenuId);
    const quantity = form.data.items[0]?.quantity ?? 1;
    const total = selectedItem ? Number(selectedItem.price) * quantity : 0;

    /* handlers */
    const openOrderModal = (presetId?: number) => {
        if (menuItems.length === 0) {
            return;
        }

        form.clearErrors();
        form.setData('items', [
            {
                menu_id: presetId ?? selectedMenuId ?? menuItems[0].id,
                quantity: 1,
            },
        ]);
        setModalOpen(true);
    };

    const adjustQty = (delta: number) => {
        if (selectedItem) {
            form.setData('items', [
                {
                    menu_id: selectedItem.id,
                    quantity: Math.min(100, Math.max(1, quantity + delta)),
                },
            ]);
        }
    };

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const whatsappWindow = window.open('about:blank', '_blank');

        form.post(createOrder.url(), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash;
                const whatsappUrl =
                    flash &&
                    typeof flash === 'object' &&
                    'whatsappUrl' in flash &&
                    typeof flash.whatsappUrl === 'string'
                        ? flash.whatsappUrl
                        : null;

                if (!whatsappUrl) {
                    whatsappWindow?.close();
                    window.alert(
                        'Pesanan sudah tersimpan, tetapi tautan WhatsApp tidak tersedia. Silakan hubungi outlet secara manual.',
                    );
                    return;
                }

                if (whatsappWindow) {
                    whatsappWindow.location.href = whatsappUrl;
                    whatsappWindow.opener = null;
                } else {
                    window.location.assign(whatsappUrl);
                }

                form.reset('customer_name', 'whatsapp_number', 'notes');
                setModalOpen(false);
            },
            onError: () => whatsappWindow?.close(),
        });
    };

    return (
        <>
            <Head title="Melted Banana — Kripik Pisang Coklat Lumer">
                <meta
                    name="description"
                    content="Kelezatan pisang matang dipadu dark chocolate lumer."
                />
            </Head>

            <div className="min-h-screen bg-paper font-sans text-cacao-800 antialiased selection:bg-banana-400 selection:text-cacao-900">
                {/* ================= HEADER ================= */}
                <header
                    className={`sticky top-0 z-40 border-b-2 border-cacao-800 px-4 py-4 backdrop-blur-md transition-all duration-300 sm:px-8 ${
                        scrolled
                            ? 'bg-craft-light/95 shadow-[0_4px_0_0_rgba(35,21,14,0.08)]'
                            : 'bg-craft-light/90'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <a href="#" className="group flex items-center gap-3">
                            <div className="craft-shadow-sm flex h-11 w-11 items-center justify-center rounded-xl bg-cacao-800 font-editorial text-xl font-black text-banana-400 transition-all group-hover:bg-cacao-700">
                                MB
                            </div>
                            <div className="flex flex-col">
                                <span className="font-editorial text-xl font-extrabold leading-none tracking-tight text-cacao-900">
                                    MELTED BANANA
                                </span>
                                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-cacao-600">
                                    Kripik Pisang Coklat Lumer
                                </span>
                            </div>
                        </a>

                        <nav className="hidden items-center gap-8 text-sm font-semibold text-cacao-800 md:flex">
                            <a
                                href="#cerita"
                                className="transition-colors hover:text-banana-600"
                            >
                                Cerita Kami
                            </a>
                            <a
                                href="#menu"
                                className="transition-colors hover:text-banana-600"
                            >
                                Katalog Menu
                            </a>
                            <a
                                href="#keunggulan"
                                className="transition-colors hover:text-banana-600"
                            >
                                Kualitas
                            </a>
                            <a
                                href="#testimoni"
                                className="transition-colors hover:text-banana-600"
                            >
                                Ulasan Real
                            </a>
                        </nav>

                        <button
                            onClick={() => openOrderModal()}
                            className="craft-shadow-sm bg-yellow-400 flex items-center gap-2 rounded-xl border-2 border-cacao-900 bg-banana-400 px-5 py-2.5 text-sm font-bold text-cacao-900 transition-all hover:bg-banana-500 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                            <i className="fa-brands fa-whatsapp text-lg" />
                            <span className="hidden sm:inline">
                                Pesan Sekarang
                            </span>
                            <span className="sm:hidden">Pesan</span>
                        </button>
                    </div>
                </header>

                {/* ================= HERO ================= */}
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        {/* left */}
                        <div className="space-y-6 lg:col-span-7">
                            <h1 className="font-editorial text-4xl font-extrabold leading-[1.1] tracking-tight text-cacao-900 sm:text-6xl">
                                Kelezatan Pisang Matang Dipadu{' '}
                                <span className="italic font-normal underline decoration-banana-400 decoration-4 underline-offset-4">
                                    Dark Chocolate
                                </span>{' '}
                                Lumer.
                            </h1>

                            <p className="max-w-2xl text-base font-medium leading-relaxed text-cacao-700 sm:text-lg">
                                Kami memadukan pisang segar pilihan dengan
                                lelehan racikan dark chocolate pahit-manis
                                melimpah. Bukan sekadar gorengan biasa, tapi
                                camilan pencuci mulut berkelas dengan standar
                                kualitas tinggi.
                            </p>

                            <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center">
                                <a
                                    href="#menu"
                                    className="craft-shadow bg-white flex items-center justify-center gap-3 rounded-xl border-2 border-cacao-900 bg-cacao-800 px-8 py-4 text-center font-bold text-banana-300 transition-all hover:bg-cacao-900 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    <span>Lihat Menu Pilihan</span>
                                    <i className="fa-solid fa-arrow-down-long" />
                                </a>

                                <button
                                    onClick={() => openOrderModal()}
                                    className="craft-shadow cursor-pointer flex items-center justify-center gap-3 rounded-xl border-2 border-cacao-900 bg-white px-8 py-4 text-center font-bold text-cacao-900 transition-all hover:bg-craft-base active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    <i className="fa-brands fa-whatsapp text-xl text-emerald-600" />
                                    <span>Pesan Langsung</span>
                                </button>

                                <button
                                    onClick={() =>
                                        window.open(SHOPEE_URL, '_blank')
                                    }
                                    className="craft-shadow flex items-center justify-center gap-3 rounded-xl border-2 border-cacao-900 bg-white px-8 py-4 text-center font-bold text-cacao-900 transition-all hover:bg-craft-base active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    <svg
                                        className="h-6 w-6 fill-[#ee4d2d]"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M19.347 7.022l-1.92-4.14A1.332 1.332 0 0 0 16.223 2H7.776a1.332 1.332 0 0 0-1.204.882l-1.92 4.14A2.665 2.665 0 0 0 4 8.211V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8.21a2.664 2.664 0 0 0-.653-1.188zM12 4a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2zm3.333 13.333h-6.666a.667.667 0 0 1 0-1.333h6.666a.667.667 0 0 1 0 1.333zm1.334-3.333H7.333a.667.667 0 0 1 0-1.334h9.334a.667.667 0 0 1 0 1.334z" />
                                    </svg>
                                    <span>Pesan Shoppe</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t-2 border-cacao-800/20 pt-8">
                                <div>
                                    <p className="font-editorial text-3xl font-extrabold text-cacao-900">
                                        100%
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-cacao-600">
                                        Dark Chocolate
                                    </p>
                                </div>
                                <div>
                                    <p className="font-editorial text-3xl font-extrabold text-cacao-900">
                                        Aman
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-cacao-600">
                                        Tidak Bikin Eneg
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* right */}
                        <div className="relative mt-6 lg:col-span-5 lg:mt-0">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                <div className="craft-shadow rotate-[1.5deg] rounded-2xl border-2 border-cacao-900 bg-white p-4 transition-transform hover:rotate-0">
                                    <div className="relative h-80 overflow-hidden rounded-xl bg-cacao-900 sm:h-96">
                                        <img
                                            src="/assets/img/melted banana.jpeg"
                                            alt="Melted Banana Premium Visual"
                                            className="h-full w-full object-cover object-center"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://placehold.co/800x800/23150e/fce48b?text=MELTED+BANANA';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-cacao-900/90 via-transparent to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <p className="text-xs font-bold uppercase tracking-widest text-banana-400">
                                                Melted Banana
                                            </p>
                                            <h3 className="mt-0.5 font-editorial text-2xl font-bold text-white">
                                                Original Dark Choco
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* paper sticker */}
                                <div className="craft-shadow-sm bg-white absolute -left-6 -top-6 hidden rotate-[-1.5deg] rounded-xl border-2 border-cacao-900 bg-banana-300 p-4 text-cacao-900 sm:block">
                                    <p className="font-editorial text-xs font-bold uppercase tracking-widest">
                                        Cerita Melted
                                    </p>
                                    <p className="mt-0.5 text-sm font-extrabold">
                                        BEST SELLER
                                    </p>
                                </div>

                                {/* stamp badge */}
                                <div className="craft-shadow-sm absolute -bottom-6 -right-4 flex h-28 w-28 rotate-[1.5deg] items-center justify-center rounded-full border-2 border-cacao-900 bg-white p-3.5 text-center text-cacao-900">
                                    <div>
                                        <i className="fa-solid fa-fire text-lg text-amber-600" />
                                        <p className="mt-1 font-editorial text-xs font-black uppercase leading-tight">
                                            Coklat Menutup Sempurna!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= CERITA ================= */}
                <section
                    id="cerita"
                    className="border-y-2 border-cacao-900 bg-amber-950 text-white py-16 text-craft-light"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                            <div className="space-y-4 lg:col-span-5">
                                <div className="craft-shadow-gold rotate-[-1.5deg] rounded-2xl border-2 border-banana-400 bg-cacao-900 p-3">
                                    <img
                                        src="/assets/img/antar.jpeg"
                                        alt="Dark Chocolate Melt Process"
                                        className="h-72 w-full rounded-xl object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://placehold.co/600x600/140c09/fce48b?text=PROSES';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 lg:col-span-7">
                                <span className="rounded-md border border-banana-400/40 bg-cacao-900 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-banana-400">
                                    Cerita Melted Banana
                                </span>

                                <h2 className="font-editorial text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                                    Dari mana ide ini berasal?
                                </h2>

                                <p className="text-base font-normal leading-relaxed text-craft-base">
                                    Berawal dari rasa penasaran terhadap perpaduan rasa gurih dan manis, indonesia Tingkat konsumsi buah pisang di Indonesia menduduki posisi pertama dibandingkan dengan komoditas buah tropis lainnya. Berdasarkan data dari Badan Pusat Statistik (BPS) mencapai 30,45 % perhari. oleh karena itu menjadikan pisang sebagai bahan baku utama untuk membuat camilan yang unik dan menarik. Melted Banana hadir sebagai inovasi camilan pisang goreng dengan lelehan dark chocolate yang lumer di mulut, memberikan pengalaman rasa yang berbeda dan memuaskan bagi para pecinta camilan manis.
                                </p>

                                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                                    <div className="rounded-xl border border-cacao-700 bg-cacao-900/60 p-4">
                                        <i className="fa-solid fa-leaf mb-2 text-xl text-banana-400" />
                                        <h4 className="text-sm font-bold text-white">
                                            Pisang Gepuk Matang Alami
                                        </h4>
                                        <p className="mt-1 text-xs text-craft-accent">
                                            Dipilih pada puncak kematangan
                                            alami agar manisnya pas dan
                                            teksturnya lembut.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-cacao-700 bg-cacao-900/60 p-4">
                                        <i className="fa-solid fa-mortar-pestle mb-2 text-xl text-banana-400" />
                                        <h4 className="text-sm font-bold text-white">
                                            Bittersweet Balance
                                        </h4>
                                        <p className="mt-1 text-xs text-craft-accent">
                                            Perpaduan pahit gurih yang
                                            menetralisir rasa manis berlebih.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= MENU ================= */}
                <section
                    id="menu"
                    className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
                >
                    <div className="mb-12 flex flex-col justify-between gap-6 border-b-2 border-cacao-900 pb-6 md:flex-row md:items-end">
                        <div>
                            <span className="rounded-md border border-cacao-900 bg-banana-300 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cacao-600">
                                Katalog Pilihan
                            </span>
                            <h2 className="mt-3 font-editorial text-3xl font-extrabold text-cacao-900 sm:text-5xl">
                                Menu Spesial Melted Banana
                            </h2>
                        </div>
                        <p className="max-w-md text-sm font-medium text-cacao-700">
                            Pilih menu yang tersedia, lalu kirim pesanan untuk
                            dikonfirmasi langsung oleh admin.
                        </p>
                    </div>

                    {menuItems.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-cacao-900/30 bg-white p-10 text-center">
                            <p className="font-editorial text-xl font-bold text-cacao-900">
                                Menu sedang disiapkan.
                            </p>
                            <p className="mt-2 text-sm text-cacao-700">
                                Silakan kembali lagi nanti.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {menuItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="craft-shadow flex flex-col overflow-hidden rounded-2xl border-2 border-cacao-900 bg-white"
                                >
                                    <div className="h-56 bg-craft-base">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-cacao-700">
                                                <i className="fa-solid fa-utensils text-4xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-editorial text-xl font-extrabold text-cacao-900">
                                                {item.name}
                                            </h3>
                                            <span className="shrink-0 rounded-md border border-cacao-900 bg-banana-100 px-2.5 py-1 font-bold text-cacao-900">
                                                Rp{' '}
                                                {Number(item.price).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="mt-3 flex-1 text-sm leading-relaxed text-cacao-700">
                                                {item.description}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => openOrderModal(item.id)}
                                            className="mt-5 bg-amber-700 cursor-pointer hover:bg-amber-900 flex w-full items-center justify-center gap-2 rounded-xl border border-cacao-900 bg-cacao-800 py-3 text-sm font-bold text-white transition-colors hover:bg-cacao-900"
                                        >
                                            <i className="fa-solid fa-cart-plus" />
                                            <span>Pesan Menu Ini</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ================= KEUNGGULAN ================= */}
                <section
                    id="keunggulan"
                    className="border-y-2 border-cacao-900 bg-craft-base py-16"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-12 max-w-2xl text-center">
                            <h2 className="font-editorial text-3xl font-extrabold text-cacao-900">
                                Standar Kualitas Melted Banana
                            </h2>
                            <p className="mt-2 text-sm font-medium text-cacao-700">
                                Prinsip sederhana yang membuat rasa produk kami
                                tetap konsisten.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {[
                                {
                                    num: '1',
                                    title: 'Selalu Fresh Digoreng',
                                    desc: 'Pisang hanya digoreng dan disiram cokelat setelah pesanan Anda masuk untuk menjaga kehangatan dan krispi luar.',
                                    tilt: 'rotate-[-1.5deg]',
                                },
                                {
                                    num: '2',
                                    title: 'Bahan Terjamin Halal',
                                    desc: 'Seluruh bahan baku dari cokelat, minyak nabati, hingga topping telah bersertifikat Halal & higienis.',
                                    tilt: '',
                                },
                                {
                                    num: '3',
                                    title: 'Kemasan Aman & Clean',
                                    desc: 'Box khusus food-grade anti bocor untuk menjaga lelehan cokelat tidak tumpah selama perjalanan pengiriman.',
                                    tilt: 'rotate-[1.5deg]',
                                },
                            ].map((f) => (
                                <div
                                    key={f.num}
                                    className={`craft-shadow rounded-2xl border-2 border-cacao-900 bg-white p-6 ${f.tilt}`}
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cacao-900 bg-banana-300 text-xl font-bold text-cacao-900">
                                        {f.num}
                                    </div>
                                    <h3 className="font-editorial text-xl font-bold text-cacao-900">
                                        {f.title}
                                    </h3>
                                    <p className="mt-2 text-xs font-medium leading-relaxed text-cacao-700">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= TESTIMONI ================= */}
                <section
                    id="testimoni"
                    className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <span className="rounded-md border border-cacao-900 bg-banana-300 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cacao-600">
                            Ulasan Jujur
                        </span>
                        <h2 className="mt-2 font-editorial text-3xl font-extrabold text-cacao-900 sm:text-4xl">
                            Kata Mereka
                        </h2>
                    </div>

                    {comments.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {comments.map((comment, index) => (
                                <div
                                    key={comment.id}
                                    className={`craft-shadow relative rounded-2xl border-2 border-cacao-900 p-6 ${
                                        index % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-banana-100'
                                    }`}
                                >
                                    <div
                                        aria-hidden="true"
                                        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-cacao-900 bg-banana-400"
                                    />
                                    <p className="text-sm font-medium italic leading-relaxed text-cacao-800 sm:text-base">
                                        “{comment.comment}”
                                    </p>
                                    <div className="mt-4 border-t border-cacao-800/10 pt-3">
                                        <p className="text-xs font-bold text-cacao-900">
                                            {comment.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-2xl border-2 border-dashed border-cacao-800/30 bg-white/70 px-6 py-10 text-center text-sm font-medium text-cacao-700">
                            Belum ada ulasan. Jadilah yang pertama berbagi
                            pengalaman!
                        </p>
                    )}

                    <div className="mt-10 text-center">
                        <Link
                            href={evaluasiPage.url()}
                            className="craft-shadow inline-flex items-center justify-center gap-2 rounded-xl border-2 border-cacao-900 bg-banana-400 px-6 py-3 font-bold text-cacao-900 transition-colors hover:bg-banana-500"
                        >
                            <i className="fa-regular fa-comment-dots" />
                            Tulis Komentar
                        </Link>
                    </div>
                </section>

                {/* ================= FOOTER ================= */}
                <footer className="border-t-2 border-cacao-900 bg-amber-950 text-white pb-12 pt-16 text-craft-light">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-10 border-b border-cacao-700 pb-12 md:grid-cols-12">
                            <div className="space-y-4 md:col-span-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-banana-400 font-editorial text-xl font-extrabold text-cacao-900">
                                        MB
                                    </div>
                                    <span className="font-editorial text-2xl font-extrabold text-white">
                                        MELTED BANANA
                                    </span>
                                </div>
                                <p className="max-w-sm text-xs leading-relaxed text-craft-accent sm:text-sm">
                                    Pelopor camilan pisang goreng dark
                                    chocolate lumer dengan rasa bittersweet
                                    autentik. Dibuat fresh setiap hari dengan
                                    bahan-bahan kualitas terbaik.
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                    {[
                                        'fa-instagram',
                                        'fa-tiktok',
                                        'fa-whatsapp',
                                    ].map((icon) => (
                                        <a
                                            key={icon}
                                            href="#"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cacao-700 bg-cacao-800 text-banana-400 transition-all hover:bg-banana-400 hover:text-cacao-900"
                                        >
                                            <i
                                                className={`fa-brands ${icon}`}
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-6">
                                <h4 className="mb-2 font-editorial text-lg font-bold text-white">
                                    Outlet & Jam Operasional
                                </h4>
                                <div className="space-y-2 text-xs text-craft-accent sm:text-sm">
                                    <p className="flex items-center gap-2">
                                        <i className="fa-regular fa-clock text-banana-400" />
                                        <span>
                                            Buka Setiap Hari: 10.00 - 21.30 WIB
                                        </span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <i className="fa-solid fa-location-dot mt-1 text-banana-400" />
                                        <span>
                                            Outlet Utama: Ds. Maribaya, Kec.
                                            Kramat, Kab. Tegal
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2 pt-1">
                                        <i className="fa-solid fa-phone text-banana-400" />
                                        <span>+62 895-3842-23639</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 text-center text-[11px] text-craft-dark">
                            <p>
                                &copy; {new Date().getFullYear()} MELTED BANANA.
                                Fathur Rizqi Putra Pratama.
                            </p>
                        </div>
                    </div>
                </footer>

                {/* ================= ORDER MODAL ================= */}
                {modalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-cacao-900/80 p-4 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setModalOpen(false);
                            }
                        }}
                    >
                        <div className="craft-shadow relative w-full max-w-lg rounded-2xl border-2 border-cacao-900 bg-craft-light p-6 transition-all sm:p-8">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-cacao-800 text-white transition-colors hover:bg-cacao-900"
                                aria-label="Tutup"
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>

                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cacao-900 bg-emerald-100 text-xl text-emerald-700">
                                    <i className="fa-brands fa-whatsapp" />
                                </div>
                                <div>
                                    <h3 className="font-editorial text-xl font-extrabold text-cacao-900">
                                        Form Pesanan Cepat
                                    </h3>
                                    <p className="text-xs font-medium text-cacao-600">
                                        Terhubung langsung ke WhatsApp Outlet
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={submitOrder}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                        Nama Pemesan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={120}
                                        value={form.data.customer_name}
                                        onChange={(e) => form.setData('customer_name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso"
                                        className="w-full rounded-xl border-2 border-cacao-900 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none"
                                    />
                                    {form.errors.customer_name && (
                                        <p className="mt-1 text-xs font-semibold text-red-700">
                                            {form.errors.customer_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                        Nomor WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={20}
                                        value={form.data.whatsapp_number}
                                        onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full rounded-xl border-2 border-cacao-900 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none"
                                    />
                                    {form.errors.whatsapp_number && (
                                        <p className="mt-1 text-xs font-semibold text-red-700">
                                            {form.errors.whatsapp_number}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                        Pilih Menu
                                    </label>
                                    <select
                                        required
                                        value={selectedItem?.id ?? ''}
                                        onChange={(e) => {
                                            const menuId = Number(e.target.value);
                                            form.setData('items', [{ menu_id: menuId, quantity: 1 }]);
                                        }}
                                        className="w-full rounded-xl border-2 border-cacao-900 bg-white px-4 py-3 text-sm font-medium focus:outline-none"
                                    >
                                        {menuItems.map((m) => (
                                            <option
                                                key={m.id}
                                                value={m.id}
                                            >
                                                {m.name} (Rp {Number(m.price).toLocaleString('id-ID')})
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.items && (
                                        <p className="mt-1 text-xs font-semibold text-red-700">
                                            {form.errors.items}
                                        </p>
                                    )}
                                </div>
                                {form.errors['items.0.quantity'] && (
                                    <p className="text-xs font-semibold text-red-700">
                                        {form.errors['items.0.quantity']}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                            Jumlah Porsi
                                        </label>
                                        <div className="flex items-center overflow-hidden rounded-xl border-2 border-cacao-900 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => adjustQty(-1)}
                                                className="bg-craft-base px-3 py-2 font-bold text-cacao-900 transition-colors hover:bg-banana-300"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                readOnly
                                                className="w-full text-center text-sm font-extrabold text-cacao-900 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => adjustQty(1)}
                                                className="bg-craft-base px-3 py-2 font-bold text-cacao-900 transition-colors hover:bg-banana-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                            Metode Ambil
                                        </label>
                                        <select
                                            value={form.data.delivery_method}
                                            onChange={(e) => form.setData('delivery_method', e.target.value)}
                                            className="w-full rounded-xl border-2 border-cacao-900 bg-white px-4 py-3 text-sm font-medium focus:outline-none"
                                        >
                                            <option value="Takeaway / Ambil Sendiri">
                                                Ambil di Outlet
                                            </option>
                                            <option value="Delivery Ojol (Gojek/Grab)">
                                                Kirim
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cacao-900">
                                        Catatan Tambahan (Opsional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        maxLength={1000}
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        placeholder="Contoh: Cokelat dipisah, tidak pakai oreo, dll."
                                        className="w-full rounded-xl border-2 border-cacao-900 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none"
                                    />
                                </div>
                                {form.errors.notes && (
                                    <p className="text-xs font-semibold text-red-700">
                                        {form.errors.notes}
                                    </p>
                                )}

                                <div className="flex items-center justify-between rounded-xl border-2 border-cacao-900 bg-banana-300 p-4">
                                    <span className="text-xs font-bold uppercase text-cacao-900">
                                        Total Estimasi:
                                    </span>
                                    <span className="font-editorial text-2xl font-black text-cacao-900">
                                        Rp {total.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing || !selectedItem}
                                    className="craft-shadow flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cacao-900 bg-emerald-600 py-3.5 font-bold text-white transition-all hover:bg-emerald-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    <i className="fa-brands fa-whatsapp text-lg" />
                                    <span>{form.processing ? 'Menyimpan pesanan...' : 'Simpan & lanjut ke WhatsApp'}</span>
                                </button>
                                <p className="text-center text-xs text-cacao-600">
                                    Pesanan dicatat di sistem sebelum WhatsApp dibuka. Admin akan mengonfirmasi ketersediaannya.
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}