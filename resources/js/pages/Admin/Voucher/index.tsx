import { Head, router, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { claim } from '@/routes/admin/vouchers';
import {
    store as createCampaign,
    update as updateCampaign,
} from '@/routes/admin/vouchers/campaigns';

interface VoucherCampaign {
    id: number;
    name: string;
    discount_type: 'fixed' | 'percentage';
    discount_value: string | number;
    min_items: number;
    is_active: boolean;
    vouchers_count: number;
}

interface VoucherRecord {
    id: number;
    customer_phone: string;
    status: string;
    campaign: string | null;
    claimed_by: string | null;
    created_at: string | null;
}

interface PageProps {
    campaigns: VoucherCampaign[];
    vouchers: VoucherRecord[];
    flash?: {
        success?: string;
    };
}

interface DetectedCode {
    rawValue: string;
}

interface QrDetector {
    detect(video: HTMLVideoElement): Promise<DetectedCode[]>;
}

interface QrDetectorConstructor {
    new (options: { formats: string[] }): QrDetector;
}

function extractVoucherToken(value: string): string {
    const match = value.trim().match(/(?:^|\/)voucher\/([A-Za-z0-9]{64})(?:[/?#]|$)/);

    return match?.[1] ?? value.trim();
}

function QrCameraScanner({
    onScan,
    onClose,
}: {
    onScan: (value: string) => void;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;
        let stream: MediaStream | null = null;
        let animationFrame = 0;
        let detector: QrDetector | null = null;

        const detectorConstructor = Reflect.get(
            window,
            'BarcodeDetector',
        ) as QrDetectorConstructor | undefined;

        if (!detectorConstructor) {
            setError(
                'Browser ini belum mendukung pemindai QR kamera. Masukkan kode voucher secara manual.',
            );
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setError(
                'Kamera membutuhkan koneksi HTTPS atau localhost. Masukkan kode voucher secara manual.',
            );
            return;
        }

        detector = new detectorConstructor({ formats: ['qr_code'] });

        const scanFrame = async () => {
            const video = videoRef.current;

            if (!isActive || !video || !detector || video.readyState < 2) {
                if (isActive) {
                    animationFrame = window.requestAnimationFrame(scanFrame);
                }

                return;
            }

            try {
                const [code] = await detector.detect(video);

                if (code) {
                    onScan(code.rawValue);
                    return;
                }
            } catch {
                setError('QR tidak terbaca. Arahkan kamera ke kode dengan jelas.');
            }

            if (isActive) {
                animationFrame = window.requestAnimationFrame(scanFrame);
            }
        };

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
            .then(async (mediaStream) => {
                if (!isActive) {
                    mediaStream.getTracks().forEach((track) => track.stop());

                    return;
                }

                stream = mediaStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    await videoRef.current.play();
                    scanFrame();
                }
            })
            .catch(() => {
                setError(
                    'Kamera tidak dapat dibuka. Izinkan akses kamera atau masukkan kode voucher secara manual.',
                );
            });

        return () => {
            isActive = false;
            window.cancelAnimationFrame(animationFrame);
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, [onScan]);

    return (
        <div className="grid gap-3">
            <video
                ref={videoRef}
                className="aspect-video w-full rounded-xl bg-black object-cover"
                muted
                playsInline
            />
            {error && (
                <p role="status" className="text-sm text-amber-800">
                    {error}
                </p>
            )}
            <button
                type="button"
                onClick={onClose}
                className="w-fit rounded-lg border border-[#23150e]/20 px-4 py-2 text-sm font-semibold text-[#38251a] hover:bg-[#f7f3ec]"
            >
                Tutup kamera
            </button>
        </div>
    );
}

export default function VoucherIndex({ campaigns, vouchers, flash }: PageProps) {
    const [cameraOpen, setCameraOpen] = useState(false);
    const [scannedToken, setScannedToken] = useState('');
    const campaignForm = useForm({
        name: '',
        discount_type: 'percentage' as 'fixed' | 'percentage',
        discount_value: '10',
        min_items: 2,
    });
    const claimForm = useForm({ token: '' });

    useEffect(() => {
        if (scannedToken) {
            claimForm.setData('token', scannedToken);
            setCameraOpen(false);
        }
    }, [scannedToken]);

    const handleScan = useCallback((value: string) => {
        setScannedToken(extractVoucherToken(value));
    }, []);

    const submitClaim = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        claimForm.post(claim.url(), {
            preserveScroll: true,
            onSuccess: () => {
                claimForm.reset();
                setScannedToken('');
            },
        });
    };

    const toggleCampaign = (campaign: VoucherCampaign) => {
        router.patch(
            updateCampaign.url(campaign.id),
            { is_active: !campaign.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Kelola Voucher" />

            <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:py-12">
                {flash?.success && (
                    <div
                        role="status"
                        className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                    >
                        {flash.success}
                    </div>
                )}

                <header className="grid gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#765b45]">
                        Promosi pelanggan
                    </p>
                    <h1 className="font-editorial text-3xl font-extrabold text-[#23150e] sm:text-4xl">
                        Kelola Voucher
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#765b45]">
                        Buat aturan promo, pindai QR pelanggan, lalu pelanggan
                        akan diarahkan untuk memberi evaluasi sebelum voucher
                        dapat dipakai.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <section className="grid content-start gap-5 rounded-2xl border-2 border-[#23150e]/15 bg-white p-5 sm:p-7">
                        <div>
                            <h2 className="font-editorial text-2xl font-bold text-[#23150e]">
                                Buat promo
                            </h2>
                            <p className="mt-1 text-sm text-[#765b45]">
                                Pelanggan perlu membeli minimal 2 item.
                            </p>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                campaignForm.post(createCampaign.url(), {
                                    preserveScroll: true,
                                    onSuccess: () => campaignForm.reset(),
                                });
                            }}
                            className="grid gap-4"
                        >
                            <label className="grid gap-1.5 text-sm font-semibold text-[#38251a]">
                                Nama promo
                                <input
                                    required
                                    maxLength={120}
                                    value={campaignForm.data.name}
                                    onChange={(event) =>
                                        campaignForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Hemat Bareng"
                                    className="h-11 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-3 font-normal outline-none focus:border-[#23150e] focus:ring-2 focus:ring-[#f4be38]/40"
                                />
                                {campaignForm.errors.name && (
                                    <span className="font-normal text-red-700">
                                        {campaignForm.errors.name}
                                    </span>
                                )}
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1.5 text-sm font-semibold text-[#38251a]">
                                    Jenis potongan
                                    <select
                                        value={campaignForm.data.discount_type}
                                        onChange={(event) =>
                                            campaignForm.setData(
                                                'discount_type',
                                                event.target.value as
                                                    | 'fixed'
                                                    | 'percentage',
                                            )
                                        }
                                        className="h-11 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-3 font-normal outline-none focus:border-[#23150e]"
                                    >
                                        <option value="percentage">
                                            Persentase (%)
                                        </option>
                                        <option value="fixed">
                                            Nominal (Rp)
                                        </option>
                                    </select>
                                </label>
                                <label className="grid gap-1.5 text-sm font-semibold text-[#38251a]">
                                    Nilai potongan
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max={
                                            campaignForm.data.discount_type ===
                                            'percentage'
                                                ? 100
                                                : 99999999
                                        }
                                        step={
                                            campaignForm.data.discount_type ===
                                            'percentage'
                                                ? '0.01'
                                                : '1'
                                        }
                                        value={campaignForm.data.discount_value}
                                        onChange={(event) =>
                                            campaignForm.setData(
                                                'discount_value',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-3 font-normal outline-none focus:border-[#23150e]"
                                    />
                                    {campaignForm.errors.discount_value && (
                                        <span className="font-normal text-red-700">
                                            {campaignForm.errors.discount_value}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <label className="grid gap-1.5 text-sm font-semibold text-[#38251a]">
                                Minimal jumlah item
                                <input
                                    required
                                    type="number"
                                    min="2"
                                    max="100"
                                    step="1"
                                    value={campaignForm.data.min_items}
                                    onChange={(event) =>
                                        campaignForm.setData(
                                            'min_items',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="h-11 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-3 font-normal outline-none focus:border-[#23150e]"
                                />
                                {campaignForm.errors.min_items && (
                                    <span className="font-normal text-red-700">
                                        {campaignForm.errors.min_items}
                                    </span>
                                )}
                            </label>

                            <button
                                type="submit"
                                disabled={campaignForm.processing}
                                className="h-11 rounded-xl border-2 border-[#23150e] bg-[#f4be38] px-4 text-sm font-bold text-[#23150e] shadow-[3px_4px_0_0_#23150e] transition hover:bg-[#f1ae1e] disabled:opacity-60"
                            >
                                {campaignForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan promo'}
                            </button>
                        </form>
                    </section>

                    <section className="grid content-start gap-5 rounded-2xl border-2 border-[#23150e]/15 bg-white p-5 sm:p-7">
                        <div>
                            <h2 className="font-editorial text-2xl font-bold text-[#23150e]">
                                Klaim QR pelanggan
                            </h2>
                            <p className="mt-1 text-sm text-[#765b45]">
                                Pindai QR dari ponsel pelanggan. Pelanggan harus
                                membiarkan halaman voucher tetap terbuka.
                            </p>
                        </div>

                        {cameraOpen && (
                            <QrCameraScanner
                                onScan={handleScan}
                                onClose={() => setCameraOpen(false)}
                            />
                        )}

                        <button
                            type="button"
                            onClick={() => setCameraOpen((open) => !open)}
                            className="h-11 rounded-xl border-2 border-[#23150e] bg-[#23150e] px-4 text-sm font-bold text-white transition hover:bg-[#38251a]"
                        >
                            {cameraOpen ? 'Tutup pemindai' : 'Buka kamera pemindai'}
                        </button>

                        <form onSubmit={submitClaim} className="grid gap-3">
                            <label
                                htmlFor="voucher-token"
                                className="text-sm font-semibold text-[#38251a]"
                            >
                                Atau masukkan kode voucher
                            </label>
                            <input
                                id="voucher-token"
                                required
                                value={claimForm.data.token}
                                onChange={(event) =>
                                    claimForm.setData(
                                        'token',
                                        extractVoucherToken(event.target.value),
                                    )
                                }
                                placeholder="Tempel tautan QR atau kode voucher"
                                className="h-11 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-3 text-sm outline-none focus:border-[#23150e]"
                            />
                            {claimForm.errors.token && (
                                <p className="text-sm text-red-700">
                                    {claimForm.errors.token}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={claimForm.processing}
                                className="h-11 rounded-xl border-2 border-[#23150e] bg-[#f4be38] px-4 text-sm font-bold text-[#23150e] shadow-[3px_4px_0_0_#23150e] transition hover:bg-[#f1ae1e] disabled:opacity-60"
                            >
                                {claimForm.processing
                                    ? 'Memeriksa voucher...'
                                    : 'Klaim voucher'}
                            </button>
                        </form>
                    </section>
                </div>

                <section className="grid gap-4">
                    <div>
                        <h2 className="font-editorial text-2xl font-bold text-[#23150e]">
                            Promo terdaftar
                        </h2>
                        <p className="mt-1 text-sm text-[#765b45]">
                            {campaigns.length} promo dibuat
                        </p>
                    </div>
                    {campaigns.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#23150e]/25 bg-white p-8 text-center text-sm text-[#765b45]">
                            Belum ada promo voucher.
                        </p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {campaigns.map((campaign) => (
                                <article
                                    key={campaign.id}
                                    className="grid gap-4 rounded-2xl border-2 border-[#23150e]/15 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                                >
                                    <div className="grid gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-editorial text-xl font-bold text-[#23150e]">
                                                {campaign.name}
                                            </h3>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                    campaign.is_active
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-stone-100 text-stone-600'
                                                }`}
                                            >
                                                {campaign.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#765b45]">
                                            Potongan{' '}
                                            {campaign.discount_type ===
                                            'percentage'
                                                ? `${campaign.discount_value}%`
                                                : `Rp ${Number(campaign.discount_value).toLocaleString('id-ID')}`}
                                            {' · '}
                                            Minimal {campaign.min_items} item
                                        </p>
                                        <p className="text-xs text-[#765b45]">
                                            {campaign.vouchers_count} voucher
                                            diterbitkan
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleCampaign(campaign)
                                        }
                                        className="rounded-lg border border-[#23150e]/20 px-3 py-2 text-sm font-semibold text-[#38251a] transition hover:bg-[#f7f3ec]"
                                    >
                                        {campaign.is_active
                                            ? 'Nonaktifkan'
                                            : 'Aktifkan'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="grid gap-4">
                    <div>
                        <h2 className="font-editorial text-2xl font-bold text-[#23150e]">
                            Voucher pelanggan terbaru
                        </h2>
                    </div>
                    {vouchers.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#23150e]/25 bg-white p-8 text-center text-sm text-[#765b45]">
                            Belum ada voucher yang diminta.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#23150e]/15 bg-white">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="bg-[#f7f3ec] text-xs uppercase tracking-wider text-[#765b45]">
                                    <tr>
                                        <th className="px-4 py-3">WhatsApp</th>
                                        <th className="px-4 py-3">Promo</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Diklaim oleh</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#23150e]/10">
                                    {vouchers.map((voucher) => (
                                        <tr key={voucher.id}>
                                            <td className="px-4 py-3 font-medium text-[#23150e]">
                                                {voucher.customer_phone}
                                            </td>
                                            <td className="px-4 py-3 text-[#765b45]">
                                                {voucher.campaign ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 capitalize text-[#765b45]">
                                                {voucher.status}
                                            </td>
                                            <td className="px-4 py-3 text-[#765b45]">
                                                {voucher.claimed_by ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
