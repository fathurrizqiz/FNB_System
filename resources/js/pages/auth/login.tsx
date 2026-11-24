import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            

            <Head title="Masuk Admin" />
            <section className="craft-shadow-sm rounded-2xl border-2 border-[#23150e] bg-[#fffdf8] p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#23150e] bg-[#f4be38] font-editorial text-xl font-black text-[#23150e]">
                        MB
                    </div>
                    <div className="grid gap-0.5">
                        <span className="font-editorial text-lg font-extrabold leading-tight tracking-tight text-[#23150e]">
                            MELTED BANANA
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#765b45]">
                            Panel pengelola
                        </span>
                    </div>
                </div>

                <div className="mb-6 grid gap-1">
                    <h2 className="font-editorial text-2xl font-extrabold tracking-tight text-[#23150e]">
                        Senang melihatmu kembali!
                    </h2>
                    <p className="text-sm leading-relaxed text-[#765b45]">
                        Masuk untuk melanjutkan mengelola menu dan pesanan.
                    </p>
                </div>

                {/* <PasskeyVerify
                    label="Masuk dengan passkey"
                    loadingLabel="Sedang memverifikasi..."
                    separator="Atau masuk dengan email"
                /> */}

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-semibold text-[#38251a]"
                                    >
                                        Alamat email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        className="h-12 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-4 shadow-none focus-visible:border-[#23150e] focus-visible:ring-[#f4be38]/40"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-semibold text-[#38251a]"
                                        >
                                            Kata sandi
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-xs font-semibold text-[#765b45] decoration-[#f4be38] hover:text-[#23150e]"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="h-12 rounded-xl border-2 border-[#23150e]/20 bg-[#f7f3ec] px-4 shadow-none focus-visible:border-[#23150e] focus-visible:ring-[#f4be38]/40"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="rounded border-[#23150e]/40 data-[state=checked]:border-[#23150e] data-[state=checked]:bg-[#23150e]"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm text-[#765b45]"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-1 h-12 w-full rounded-xl border-2 border-[#23150e] bg-[#f4be38] text-sm font-bold text-[#23150e] shadow-[3px_4px_0_0_#23150e] transition-all hover:bg-[#f1ae1e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Masuk
                                </Button>
                            </div>

                            <div className="border-t border-dashed border-[#23150e]/20 pt-5 text-center text-xs text-[#765b45]">
                                Akses masuk hanya untuk admin.
                            </div>
                        </>
                    )}
                </Form>

                {status && (
                    <div className="mt-5 rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
                        {status}
                    </div>
                )}
            </section>
        </>
    );
}


