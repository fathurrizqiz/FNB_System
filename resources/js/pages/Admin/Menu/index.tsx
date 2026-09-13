import { Head, Link, router } from "@inertiajs/react";
import { create, destroy, edit } from "@/routes/admin/menu";

/* ---------------- types ---------------- */
interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number | string;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

interface FlashProps {
    success?: string;
    error?: string;
}

interface PageProps {
    menuItems: MenuItem[];
    flash?: FlashProps;
}

/* ---------------- component ---------------- */
export default function Index({ menuItems, flash }: PageProps) {
    const handleDelete = (id: number, name: string) => {
        if (
            !confirm(
                `Hapus menu "${name}"? Tindakan ini tidak bisa dibatalkan.`,
            )
        ) {
            return;
        }

        router.delete(destroy.url(id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Daftar Menu" />

            <div className="mx-auto max-w-6xl px-6 py-10">
                {/* Flash Message */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        <svg
                            className="h-5 w-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Daftar Menu
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {menuItems.length} item terdaftar
                        </p>
                    </div>

                    <Link
                        href={create.url()}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Tambah Menu
                    </Link>
                </div>

                {/* Content */}
                {menuItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
                        <p className="text-gray-500">Belum ada menu.</p>
                        <Link
                            href={create.url()}
                            className="mt-4 inline-block text-sm font-medium text-black underline underline-offset-4"
                        >
                            Tambah menu pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {menuItems.map((item) => (
                            <div
                                key={item.id}
                                className="group overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    {item.image ? (
                                        <img
                                            src={`/storage/${item.image}`}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                            Tanpa gambar
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4">
                                    <h2 className="font-semibold leading-tight">
                                        {item.name}
                                    </h2>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                        {item.description || "—"}
                                    </p>
                                    <p className="mt-3 font-mono text-sm font-medium">
                                        Rp{" "}
                                        {Number(item.price).toLocaleString(
                                            "id-ID",
                                        )}
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={edit.url(item.id)}
                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-gray-50"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(item.id, item.name)
                                            }
                                            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
