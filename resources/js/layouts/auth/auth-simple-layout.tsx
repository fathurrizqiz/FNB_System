import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {(title || description) && (
                        <div className="space-y-2 text-center">
                            {title && (
                                <h1 className="text-xl font-medium">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-muted-foreground text-center text-sm">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
