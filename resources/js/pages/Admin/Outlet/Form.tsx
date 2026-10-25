import { Head, Link, useForm } from '@inertiajs/react';
import { index, store, update } from '@/routes/admin/outlets';

interface Outlet {
    id: number;
    name: string;
    address: string;
    description: string | null;
    phone: string | null;
    is_active: boolean;
}

interface FormData {
    name: string;
    address: string;
    description: string;
    phone: string;
    is_active: boolean;
}

interface FormProps {
    outlet?: Outlet;
}

export default function OutletForm({ outlet }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: outlet?.name ?? '',
        address: outlet?.address ?? '',
        description: outlet?.description ?? '',
        phone: outlet?.phone ?? '',
        is_active: outlet?.is_active ?? true,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (outlet) {
            put(update.url(outlet.id));
            return;
        }

        post(store.url());
    };

    const inputClass = (hasError: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 ${
            hasError
                ? 'border-red-400 bg-red-50/50'
                : 'border-gray-300 focus:border-black'
        }`;

    return (
        <>
            <Head title={outlet ? 'Edit Outlet' : 'Tambah Outlet'} />

            <div className="mx-auto max-w-3xl px-6 py-10">
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        href={index.url()}
                        className="transition-colors hover:text-black"
                    >
                        Outlet
                    </Link>
                    <span>/</span>
                    <span className="text-black">
                        {outlet ? 'Edit' : 'Tambah Baru'}
                    </span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {outlet ? 'Edit Outlet' : 'Tambah Outlet'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Isi lokasi tempat pelanggan dapat menemukan Melted
                        Banana.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <section className="space-y-5 rounded-xl border bg-white p-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Nama outlet{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                maxLength={255}
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Contoh: Kantin SMP Harapan"
                                className={inputClass(Boolean(errors.name))}
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="address"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Alamat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="address"
                                type="text"
                                required
                                maxLength={255}
                                value={data.address}
                                onChange={(event) =>
                                    setData('address', event.target.value)
                                }
                                placeholder="Contoh: Jl. Pendidikan No. 12, Bandung"
                                className={inputClass(Boolean(errors.address))}
                            />
                            {errors.address && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Keterangan
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                maxLength={2000}
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder="Petunjuk lokasi atau jam operasional"
                                className={inputClass(
                                    Boolean(errors.description),
                                )}
                            />
                            {errors.description && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Nomor telepon / WhatsApp
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                maxLength={30}
                                value={data.phone}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                placeholder="Contoh: 081234567890"
                                className={inputClass(Boolean(errors.phone))}
                            />
                            {errors.phone && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) =>
                                    setData('is_active', event.target.checked)
                                }
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-black"
                            />
                            <span>
                                <span className="block text-sm font-medium">
                                    Tampilkan di landing page
                                </span>
                                <span className="mt-1 block text-xs text-gray-500">
                                    Outlet nonaktif hanya terlihat di halaman
                                    admin.
                                </span>
                            </span>
                        </label>
                        {errors.is_active && (
                            <p className="text-xs text-red-600">
                                {errors.is_active}
                            </p>
                        )}
                    </section>

                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href={index.url()}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : outlet
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Outlet'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
