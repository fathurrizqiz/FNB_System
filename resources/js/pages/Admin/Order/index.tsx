import { Head } from "@inertiajs/react";
import { useMemo } from "react";
// import { destroy } from "@/routes/admin/order";

/* ---------------- types ---------------- */
interface OrderMenu {
    id: number;
    menu_id: number;
    quantity: number;
    status: string;
    whatsapp_number: string | null;
    created_at: string;
    updated_at: string;
}

interface Menu {
    id: number;
    name: string;
    price: number | string;
    description: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface OrderWithMenu extends OrderMenu {
    menu: Menu;
}

interface FlashProps {
    success?: string;
    error?: string;
}

interface PageProps {
    order: OrderWithMenu[];
    flash?: FlashProps;
}

/* ---------------- helpers ---------------- */
const rupiah = (n: number | string) =>
    "Rp " + Number(n).toLocaleString("id-ID");

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
    });

/* ---------------- component ---------------- */
export default function OrderIndex({ order, flash }: PageProps) {
    /* ---------- aggregate stats ---------- */
    const stats = useMemo(() => {
        const totalItems = order.reduce((s, o) => s + o.quantity, 0);
        const totalRevenue = order.reduce(
            (s, o) => s + o.quantity * Number(o.menu.price),
            0,
        );
        const uniqueMenu = new Set(order.map((o) => o.menu_id)).size;
        const orderCount = order.length;

        return { totalItems, totalRevenue, uniqueMenu, orderCount };
    }, [order]);

    /* ---------- group by menu ---------- */
    const grouped = useMemo(() => {
        const map = new Map<number, { menu: Menu; lines: OrderWithMenu[] }>();

        order.forEach((o) => {
            if (!map.has(o.menu_id)) {
                map.set(o.menu_id, { menu: o.menu, lines: [] });
            }
            map.get(o.menu_id)!.lines.push(o);
        });

        return Array.from(map.values())
            .map((g) => ({
                ...g,
                totalQty: g.lines.reduce((s, l) => s + l.quantity, 0),
                totalPrice: g.lines.reduce(
                    (s, l) => s + l.quantity * Number(l.menu.price),
                    0,
                ),
            }))
            .sort((a, b) => b.totalQty - a.totalQty);
    }, [order]);

    /* ---------- delete ---------- */
    // const handleDelete = (id: number, menuName: string) => {
    //     if (
    //         !confirm(
    //             `Hapus order untuk "${menuName}"? Tindakan ini tidak bisa dibatalkan.`,
    //         )
    //     ) {
    //         return;
    //     }

    //     router.delete(destroy.url(id), { preserveScroll: true });
    // };

    return (
        <>
            <Head title="Daftar Order" />

            <div className="min-h-screen bg-white font-sans text-[#171310] selection:bg-[#064E3B] selection:text-[#F4EFE6]">
                {/* grain */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0 opacity-[.035] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />

                <div className="relative z-10 mx-auto max-w-350 px-6 py-12 md:px-10 md:py-16">
                    {/* FLASH */}
                    {flash?.success && (
                        <div className="mb-10 flex items-center gap-3 border-l-2 border-[#6B7250] bg-[#6B7250]/8 px-5 py-4 text-sm">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#6B7250] text-[#F4EFE6]">
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </span>
                            <span className="font-medium text-[#171310]">
                                {flash.success}
                            </span>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-10 flex items-center gap-3 border-l-2 border-[#064E3B] bg-[#064E3B]/8 px-5 py-4 text-sm">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#064E3B] text-[#F4EFE6]">
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        d="M12 8v5M12 16.5v.01M12 3l9 16H3l9-16z"
                                    />
                                </svg>
                            </span>
                            <span className="font-medium text-[#171310]">
                                {flash.error}
                            </span>
                        </div>
                    )}

                    {/* HEADER */}
                    <header className="mb-14 border-b border-[#171310]/10 pb-10">
                        <p className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#171310]/50">
                            <span className="h-px w-8 bg-[#171310]/30" />
                            Daftar Pesanan
                        </p>

                        <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
                            Yang dipesan{" "}
                            <em className="italic text-[#064E3B]">hari ini</em>.
                        </h1>

                        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#171310]/60">
                            Semua order yang masuk dari pelanggan. Kelola
                            kuantitas dan pantau pendapatan dari sini.
                        </p>
                    </header>

                    {/* STATS STRIP */}
                    <div className="mb-14 grid grid-cols-2 gap-6 border-b border-[#171310]/10 pb-8 md:grid-cols-4 md:gap-12">
                        <div>
                            <p className="font-serif text-4xl leading-none">
                                {String(stats.orderCount).padStart(2, "0")}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-[#171310]/50">
                                Total baris order
                            </p>
                        </div>
                        <div>
                            <p className="font-serif text-4xl leading-none">
                                {stats.totalItems}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-[#171310]/50">
                                Total item terjual
                            </p>
                        </div>
                        <div>
                            <p className="font-serif text-4xl leading-none">
                                {String(stats.uniqueMenu).padStart(2, "0")}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-[#171310]/50">
                                Menu unik dipesan
                            </p>
                        </div>
                        <div>
                            <p className="font-serif text-4xl leading-none text-[#064E3B]">
                                {rupiah(stats.totalRevenue)}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-[#171310]/50">
                                Total pendapatan
                            </p>
                        </div>
                    </div>

                    {/* CONTENT */}
                    {order.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {/* table header (desktop only) */}
                            <div className="hidden grid-cols-12 gap-4 border-b border-[#171310]/15 px-4 pb-3 text-[10px] uppercase tracking-widest text-[#171310]/40 md:grid">
                                <div className="col-span-5">Menu</div>
                                <div className="col-span-2 text-center">
                                    Qty
                                </div>
                                <div className="col-span-2 text-right">
                                    Harga Satuan
                                </div>
                                <div className="col-span-2 text-right">
                                    Subtotal
                                </div>
                                <div className="col-span-1 text-right">
                                    Status
                                </div>
                            </div>

                            {/* group list */}
                            {grouped.map((group, gi) => (
                                <GroupBlock
                                    key={group.menu.id}
                                    group={group}
                                    groupIndex={gi}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ============================================================
   GroupBlock — satu menu + semua order-nya
============================================================ */
function GroupBlock({
    group,
    groupIndex,
    onDelete,
}: {
    group: {
        menu: Menu;
        lines: OrderWithMenu[];
        totalQty: number;
        totalPrice: number;
    };
    groupIndex: number;
}) {
    return (
        <div
            className="border rounded-2xl border-[#171310]/10 bg-white"
            style={{
                animation: `fadeUp .6s cubic-bezier(.16,1,.3,1) ${groupIndex * 0.05}s both`,
            }}
        >
            {/* group header */}
            <div className="grid grid-cols-12 items-center gap-4 border-b border-[#171310]/10 bg-[#171310]/3 px-4 py-3">
                <div className="col-span-12 flex items-center gap-3 md:col-span-5">
                    {/* thumb */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden bg-[#171310]/5 md:h-14 md:w-14">
                        {group.menu.image ? (
                            <img
                                src={`/storage/${group.menu.image}`}
                                alt={group.menu.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="grid h-full place-items-center text-[9px] uppercase tracking-widest text-[#171310]/30">
                                —
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-serif text-xl leading-tight">
                            {group.menu.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#171310]/50">
                            {rupiah(group.menu.price)} · {group.lines.length}{" "}
                            order
                        </p>
                    </div>
                </div>

                {/* desktop inline stats */}
                <div className="col-span-2 hidden text-center font-serif text-lg md:block">
                    {group.totalQty}
                </div>
                <div className="col-span-2 hidden text-right text-xs text-[#171310]/60 md:block">
                    {rupiah(group.menu.price)}
                </div>
                <div className="col-span-2 hidden text-right font-serif text-lg text-[#064E3B] md:block">
                    {rupiah(group.totalPrice)}
                </div>
                <div className="col-span-1 hidden md:block" />
            </div>

            {/* individual lines */}
            <div className="divide-y divide-[#171310]/8">
                {group.lines.map((line, li) => (
                    <div
                        key={line.id}
                        className="group/row grid grid-cols-12 items-center gap-4 px-4 py-3 transition-colors hover:bg-[#171310]/2"
                        style={{
                            animation: `fadeIn .5s ease ${groupIndex * 0.05 + li * 0.03}s both`,
                        }}
                    >
                        {/* order meta */}
                        <div className="col-span-12 md:col-span-5">
                            <p className="text-xs uppercase tracking-widest text-[#171310]/40">
                                Order #{String(line.id).padStart(4, "0")}
                            </p>
                            <p className="mt-0.5 text-xs text-[#171310]/50">
                                {formatDate(line.created_at)}
                            </p>
                        </div>

                        {/* qty */}
                        <div className="col-span-4 flex items-baseline gap-2 md:col-span-2 md:justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-[#171310]/40 md:hidden">
                                Qty
                            </span>
                            <span className="font-serif text-base">
                                {line.quantity}
                            </span>
                        </div>

                        {/* unit price */}
                        <div className="col-span-4 text-right md:col-span-2">
                            <span className="text-[10px] uppercase tracking-widest text-[#171310]/40 md:hidden">
                                Harga
                            </span>
                            <span className="hidden text-xs text-[#171310]/60 md:inline">
                                {rupiah(line.menu.price)}
                            </span>
                        </div>

                        {/* subtotal */}
                        <div className="col-span-4 text-right md:col-span-2">
                            <span className="text-[10px] uppercase tracking-widest text-[#171310]/40 md:hidden">
                                Subtotal
                            </span>
                            <span className="font-serif text-base md:text-lg">
                                {rupiah(
                                    line.quantity * Number(line.menu.price),
                                )}
                            </span>
                        </div>
                        <div className="col-span-12 mt-2 text-xs text-[#171310]/50 md:hidden">
                            <span className="mr-2 uppercase tracking-widest">
                                Status
                            </span>
                            <StatusBadge status={line.status} />
                        </div>

                        <div className="col-span-1 hidden text-right md:block">
                            <StatusBadge status={line.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string | null }): JSX.Element {
    const normalizedStatus = status || "pending";

    return (
        <span className="inline-flex rounded-full bg-[#064E3B]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-[#064E3B]">
            {normalizedStatus}
        </span>
    );
}

/* ============================================================
   Empty State
============================================================ */
function EmptyState() {
    return (
        <div className="border border-dashed border-[#171310]/15 py-24 text-center">
            <p className="mb-2 font-serif text-3xl italic text-[#171310]/40">
                Belum ada order masuk.
            </p>
            <p className="text-sm text-[#171310]/50">
                Ketika pelanggan memesan, order akan muncul di sini.
            </p>
        </div>
    );
}

/* ============================================================
   keyframes inject
============================================================ */
if (typeof document !== "undefined") {
    const kf = `
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
    `;
    const el = document.getElementById("order-kf");
    if (!el) {
        const s = document.createElement("style");
        s.id = "order-kf";
        s.innerHTML = kf;
        document.head.appendChild(s);
    }
}
