import { Head, Link, router } from '@inertiajs/react';
import { create, destroy, edit } from '@/routes/admin/outlets';

interface Outlet {
    id: number;
    name: string;
    address: string;
    description: string | null;
    phone: string | null;
    is_active: boolean;
}

interface PageProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
    };
}

export default function Index({ outlets, flash }: PageProps) {
    const handleDelete = (outlet: Outlet) => {
        if (
            !confirm(
                `Hapus outlet "${outlet.name}"? Tindakan ini tidak bisa dibatalkan.`,
            )
        ) {
            return;
        }

        router.delete(destroy.url(outlet.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kelola Outlet" />

            <div className="mx-auto max-w-6xl px-6 py-10">
                {flash?.success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Titik penjualan
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                            Kelola Outlet
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {outlets.length} lokasi terdaftar
                        </p>
                    </div>
                    <Link
                        href={create.url()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                        <span aria-hidden="true">+</span>
                        Tambah Outlet
                    </Link>
                </div>

                {outlets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 px-6 py-20 text-center">
                        <h2 className="text-lg font-semibold">
                            Belum ada outlet
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Tambahkan lokasi pertama untuk ditampilkan kepada
                            pelanggan.
                        </p>
                        <Link
                            href={create.url()}
                            className="mt-5 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
                        >
                            Tambah outlet pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {outlets.map((outlet) => (
                            <article
                                key={outlet.id}
                                className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-lg font-semibold">
                                        {outlet.name}
                                    </h2>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            outlet.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {outlet.is_active
                                            ? 'Aktif'
                                            : 'Nonaktif'}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                    {outlet.address}
                                </p>
                                {outlet.description && (
                                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                                        {outlet.description}
                                    </p>
                                )}
                                {outlet.phone && (
                                    <p className="mt-3 text-sm text-gray-600">
                                        {outlet.phone}
                                    </p>
                                )}
                                <div className="mt-auto flex gap-2 pt-5">
                                    <Link
                                        href={edit.url(outlet.id)}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-gray-50"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(outlet)}
                                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
