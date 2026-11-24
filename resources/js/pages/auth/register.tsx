import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Pendaftaran Ditutup" />
            <section className="craft-shadow-sm grid gap-5 rounded-2xl border-2 border-[#23150e] bg-[#fffdf8] p-6 text-center sm:p-8">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl border-2 border-[#23150e] bg-[#f4be38] font-editorial text-xl font-black text-[#23150e]">
                    MB
                </div>
                <div className="grid gap-2">
                    <h1 className="font-editorial text-2xl font-extrabold text-[#23150e]">
                        Pendaftaran akun ditutup
                    </h1>
                    <p className="text-sm leading-relaxed text-[#765b45]">
                        Akun hanya disediakan untuk pengelola. Pelanggan dapat
                        melihat menu, meminta voucher, dan memesan langsung
                        melalui halaman utama.
                    </p>
                </div>
                <Link
                    href={login()}
                    className="rounded-xl border-2 border-[#23150e] bg-[#f4be38] px-4 py-3 text-sm font-bold text-[#23150e] shadow-[3px_4px_0_0_#23150e] transition hover:bg-[#f1ae1e]"
                >
                    Masuk sebagai admin
                </Link>
            </section>
        </>
    );
}

Register.layout = {
    title: 'Pendaftaran ditutup',
    description: 'Akun pengelola dibuat oleh administrator',
};
