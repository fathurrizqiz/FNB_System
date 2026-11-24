import { Head, Link, router, usePoll } from '@inertiajs/react';
import { useEffect } from 'react';
import { view as evaluationPage } from '@/routes/evaluasi';
import { home } from '@/routes';

interface VoucherCampaign {
    name: string;
    discount_type: 'fixed' | 'percentage';
    discount_value: string | number;
    min_items: number;
}

interface PageProps {
    token: string;
    status: 'issued' | 'claimed' | 'evaluated' | 'reserved' | 'redeemed' | 'inactive';
    qrCode: string | null;
    campaign: VoucherCampaign;
}

export default function VoucherShow({
    token,
    status,
    qrCode,
    campaign,
}: PageProps) {
    const { start, stop } = usePoll(
        2000,
        { only: ['status'] },
        { autoStart: false },
    );

    useEffect(() => {
        if (status === 'issued') {
            start();
        } else {
            stop();
        }
    }, [start, status, stop]);

    useEffect(() => {
        if (status === 'claimed') {
            router.visit(
                evaluationPage.url({ query: { voucher: token } }),
            );
        }
    }, [status, token]);

    const discount =
        campaign.discount_type === 'percentage'
            ? `${campaign.discount_value}%`
            : `Rp ${Number(campaign.discount_value).toLocaleString('id-ID')}`;

    return (
        <>
            <Head title="Voucher Melted Banana" />
            <main className="bg-paper flex min-h-svh items-center justify-center px-4 py-10 text-[#23150e]">
                <section className="craft-shadow w-full max-w-md rounded-2xl border-2 border-[#23150e] bg-[#fffdf8] p-6 text-center sm:p-8">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-xl border-2 border-[#23150e] bg-[#f4be38] font-editorial text-2xl font-black">
                        MB
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#765b45]">
                        MELTED BANANA
                    </p>
                    <h1 className="mt-2 font-editorial text-3xl font-extrabold">
                        {campaign.name}
                    </h1>
                    <p className="mt-2 text-sm text-[#765b45]">
                        Potongan {discount} dengan minimal {campaign.min_items}{' '}
                        item.
                    </p>

                    {status === 'issued' && qrCode && (
                        <>
                            <div className="mx-auto mt-6 w-fit rounded-xl border border-[#23150e]/10 bg-white p-3">
                                <img
                                    src={qrCode}
                                    alt="QR code voucher untuk dipindai admin"
                                    className="size-64"
                                />
                            </div>
                            <p className="mt-5 text-sm leading-relaxed text-[#765b45]">
                                Tunjukkan QR ini kepada admin. Biarkan halaman
                                ini tetap terbuka; setelah QR diklaim, kamu akan
                                diarahkan ke halaman evaluasi.
                            </p>
                            <div
                                role="status"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900"
                            >
                                <span className="size-2 animate-pulse rounded-full bg-amber-600" />
                                Menunggu admin memindai QR
                            </div>
                        </>
                    )}

                    {status === 'claimed' && (
                        <p role="status" className="mt-6 text-sm text-[#765b45]">
                            QR berhasil diklaim. Membuka halaman evaluasi...
                        </p>
                    )}

                    {status === 'evaluated' && (
                        <div className="mt-6 grid gap-4">
                            <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                                Evaluasi selesai. Voucher siap digunakan pada
                                pesanan berikutnya.
                            </p>
                            <Link
                                href={home()}
                                className="rounded-xl border-2 border-[#23150e] bg-[#f4be38] px-5 py-3 text-sm font-bold shadow-[3px_4px_0_0_#23150e] transition hover:bg-[#f1ae1e]"
                            >
                                Kembali ke menu
                            </Link>
                        </div>
                    )}

                    {status === 'inactive' && (
                        <p role="alert" className="mt-6 text-sm text-red-700">
                            Promo ini sudah tidak aktif dan QR tidak dapat
                            diklaim.
                        </p>
                    )}

                    {status === 'reserved' && (
                        <p className="mt-6 text-sm text-[#765b45]">
                            Voucher sedang digunakan pada pesanan.
                        </p>
                    )}

                    {status === 'redeemed' && (
                        <p className="mt-6 text-sm text-[#765b45]">
                            Voucher ini sudah digunakan.
                        </p>
                    )}
                </section>
            </main>
        </>
    );
}
