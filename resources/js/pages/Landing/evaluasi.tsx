import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { home } from '@/routes';
import { store as submitEvaluation } from '@/routes/evaluasi';

interface MenuOption {
    id: number;
    name: string;
}

interface PageProps {
    voucherToken: string | null;
    menus: MenuOption[];
}

export default function EvaluasiPage({ voucherToken, menus }: PageProps) {
    const form = useForm({
        name: '',
        comment: '',
        voucher_token: voucherToken ?? '',
        menu_id: '' as number | '',
        rating: '' as number | '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(submitEvaluation.url(), {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Tulis Komentar — Melted Banana" />

            <main className="bg-paper text-cacao-800 min-h-screen px-4 py-10 font-sans sm:px-6 sm:py-16">
                <div className="mx-auto max-w-2xl">
                    <Link
                        href={`${home.url()}#testimoni`}
                        className="text-cacao-700 hover:text-cacao-900 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left" />
                        Kembali ke halaman utama
                    </Link>

                    <section className="craft-shadow border-cacao-900 mt-8 rounded-2xl border-2 bg-white p-6 sm:p-10">
                        <div className="mb-8">
                            <span className="border-cacao-900 bg-banana-300 text-cacao-800 rounded-md border px-3 py-1 text-xs font-bold tracking-widest uppercase">
                                Ulasan Pelanggan
                            </span>
                            <h1 className="font-editorial text-cacao-900 mt-4 text-3xl font-extrabold sm:text-4xl">
                                Bagikan pengalamanmu
                            </h1>
                            <p className="text-cacao-700 mt-2 text-sm leading-relaxed">
                                {voucherToken
                                    ? 'Beri rating untuk salah satu produk sebagai langkah terakhir sebelum voucher dapat digunakan. Komentar bersifat opsional.'
                                    : 'Ceritakan pendapatmu tentang Melted Banana. Komentarmu akan ditampilkan di halaman utama.'}
                            </p>
                        </div>

                        {form.wasSuccessful && (
                            <p
                                role="status"
                                className="mb-6 rounded-xl border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                            >
                                Terima kasih! Komentar kamu berhasil dikirim.
                            </p>
                        )}

                        <form onSubmit={submit} className="grid gap-6">
                            {voucherToken && (
                                <>
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="menu_id"
                                            className="text-cacao-900 text-sm font-bold"
                                        >
                                            Produk yang dinilai
                                        </label>
                                        <select
                                            id="menu_id"
                                            required
                                            value={form.data.menu_id}
                                            onChange={(event) =>
                                                form.setData(
                                                    'menu_id',
                                                    Number(event.target.value),
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                form.errors.menu_id,
                                            )}
                                            className="border-cacao-900 bg-craft-light text-cacao-900 focus:ring-banana-500 w-full rounded-xl border-2 px-4 py-3 text-sm transition outline-none focus:ring-2"
                                        >
                                            <option value="" disabled>
                                                Pilih produk
                                            </option>
                                            {menus.map((menu) => (
                                                <option
                                                    key={menu.id}
                                                    value={menu.id}
                                                >
                                                    {menu.name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.menu_id && (
                                            <p className="text-sm font-medium text-red-700">
                                                {form.errors.menu_id}
                                            </p>
                                        )}
                                    </div>

                                    <fieldset className="grid gap-2">
                                        <legend className="text-cacao-900 text-sm font-bold">
                                            Rating produk
                                        </legend>
                                        <div
                                            className="flex items-center gap-2"
                                            role="radiogroup"
                                            aria-label="Rating produk 1 sampai 5"
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <label
                                                    key={rating}
                                                    className="cursor-pointer"
                                                >
                                                    <input
                                                        className="peer sr-only"
                                                        type="radio"
                                                        name="rating"
                                                        value={rating}
                                                        checked={
                                                            form.data.rating ===
                                                            rating
                                                        }
                                                        onChange={() =>
                                                            form.setData(
                                                                'rating',
                                                                rating,
                                                            )
                                                        }
                                                    />
                                                    <span
                                                        aria-label={`${rating} bintang`}
                                                        className={`inline-flex size-11 items-center justify-center rounded-lg border-2 text-xl transition peer-focus-visible:ring-2 peer-focus-visible:ring-banana-500 ${
                                                            form.data.rating ===
                                                            rating
                                                                ? 'border-cacao-900 bg-banana-300 text-cacao-900'
                                                                : 'border-cacao-900/20 bg-white text-cacao-400 hover:border-cacao-900'
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {form.errors.rating && (
                                            <p className="text-sm font-medium text-red-700">
                                                {form.errors.rating}
                                            </p>
                                        )}
                                    </fieldset>
                                </>
                            )}

                            <div className="grid gap-2">
                                <label
                                    htmlFor="name"
                                    className="text-cacao-900 text-sm font-bold"
                                >
                                    Nama
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    maxLength={50}
                                    autoComplete="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.name)}
                                    aria-describedby={
                                        form.errors.name
                                            ? 'name-error'
                                            : undefined
                                    }
                                    className="border-cacao-900 bg-craft-light text-cacao-900 focus:ring-banana-500 w-full rounded-xl border-2 px-4 py-3 text-sm transition outline-none focus:ring-2"
                                    placeholder="Nama kamu"
                                />
                                {form.errors.name && (
                                    <p
                                        id="name-error"
                                        className="text-sm font-medium text-red-700"
                                    >
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="comment"
                                    className="text-cacao-900 text-sm font-bold"
                                >
                                    Komentar
                                </label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    required={!voucherToken}
                                    rows={6}
                                    maxLength={1000}
                                    value={form.data.comment}
                                    onChange={(event) =>
                                        form.setData(
                                            'comment',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(form.errors.comment)}
                                    aria-describedby={
                                        form.errors.comment
                                            ? 'comment-error'
                                            : undefined
                                    }
                                    className="border-cacao-900 bg-craft-light text-cacao-900 focus:ring-banana-500 w-full resize-y rounded-xl border-2 px-4 py-3 text-sm leading-relaxed transition outline-none focus:ring-2"
                                    placeholder={
                                        voucherToken
                                            ? 'Komentar (opsional)'
                                            : 'Tulis komentar kamu di sini...'
                                    }
                                />
                                <div className="flex items-start justify-between gap-4">
                                    {form.errors.comment ? (
                                        <p
                                            id="comment-error"
                                            className="text-sm font-medium text-red-700"
                                        >
                                            {form.errors.comment}
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-cacao-600 shrink-0 text-xs">
                                        {form.data.comment.length}/1000
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="craft-shadow border-cacao-900 bg-banana-400 text-cacao-900 hover:bg-banana-500 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin" />
                                        Menyimpan evaluasi...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-paper-plane" />
                                        {voucherToken
                                            ? 'Simpan Evaluasi & Aktifkan Voucher'
                                            : 'Kirim Komentar'}
                                    </>
                                )}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}
