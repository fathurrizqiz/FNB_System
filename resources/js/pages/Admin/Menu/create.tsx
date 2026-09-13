import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { store, index } from '@/routes/admin/menu';

/* ---------------- types ---------------- */
interface FormData {
    name: string;
    description: string;
    price: string;
    image: File | null;
}

/* ---------------- component ---------------- */
export default function Create() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        description: '',
        price: '',
        image: null,
    });

    /* ---------- image handler ---------- */
    const handleFile = (file: File | null) => {
        setData('image', file);

        if (preview) URL.revokeObjectURL(preview);

        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] ?? null);
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const onDragLeave = () => setDragging(false);

    const clearImage = () => {
        handleFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ---------- submit ---------- */
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Tambah Menu" />

            <div className="mx-auto max-w-4xl px-6 py-10">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        href={index.url()}
                        className="transition-colors hover:text-black"
                    >
                        Menu
                    </Link>
                    <span>/</span>
                    <span className="text-black">Tambah Baru</span>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Tambah Menu
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Isi detail menu yang akan ditampilkan di halaman utama.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Card: Info Dasar */}
                    <section className="rounded-xl border bg-white p-6">
                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400">
                            Informasi Menu
                        </h2>

                        <div className="space-y-5">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Nama Menu{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Contoh: Es Kopi Senja"
                                    autoFocus
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 ${
                                        errors.name
                                            ? 'border-red-400 bg-red-50/50'
                                            : 'border-gray-300 focus:border-black'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Deskripsi
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Bahan-bahan, karakter rasa, dsb..."
                                    className={`w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 ${
                                        errors.description
                                            ? 'border-red-400 bg-red-50/50'
                                            : 'border-gray-300 focus:border-black'
                                    }`}
                                />
                                <div className="mt-1.5 flex items-center justify-between">
                                    {errors.description ? (
                                        <p className="text-xs text-red-600">
                                            {errors.description}
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {data.description.length} karakter
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label
                                    htmlFor="price"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Harga{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                        Rp
                                    </span>
                                    <input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="500"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', e.target.value)
                                        }
                                        placeholder="28000"
                                        className={`w-full rounded-lg border py-2.5 pl-11 pr-4 text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 ${
                                            errors.price
                                                ? 'border-red-400 bg-red-50/50'
                                                : 'border-gray-300 focus:border-black'
                                        }`}
                                    />
                                </div>
                                {data.price && !errors.price && (
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Tampil sebagai:{' '}
                                        <span className="font-mono font-medium text-black">
                                            Rp{' '}
                                            {Number(
                                                data.price,
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </p>
                                )}
                                {errors.price && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Card: Gambar */}
                    <section className="rounded-xl border bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                                Gambar Menu
                            </h2>
                            <span className="text-xs text-gray-400">
                                JPEG, PNG, GIF · Maks 2MB
                            </span>
                        </div>

                        {preview ? (
                            /* Preview state */
                            <div className="relative overflow-hidden rounded-lg border">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="aspect-video w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-red-600"
                                    aria-label="Hapus gambar"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <p className="text-sm font-medium text-white">
                                        {data.image?.name}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {data.image &&
                                            (
                                                data.image.size /
                                                1024
                                            ).toFixed(1)}{' '}
                                        KB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Drop zone */
                            <div
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
                                    dragging
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-gray-100">
                                    <svg
                                        className="h-6 w-6 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium">
                                    Klik untuk pilih gambar
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    atau seret file ke sini
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            className="hidden"
                        />

                        {errors.image && (
                            <p className="mt-2 text-xs text-red-600">
                                {errors.image}
                            </p>
                        )}
                    </section>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-6">
                        <Link
                            href={index.url()}
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                                        />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    Simpan Menu
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
                                            d="M5 12h14M13 6l6 6-6 6"
                                        />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}