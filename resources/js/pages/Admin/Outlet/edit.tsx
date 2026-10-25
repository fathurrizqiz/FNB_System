import OutletForm from './Form';

interface Outlet {
    id: number;
    name: string;
    address: string;
    description: string | null;
    phone: string | null;
    is_active: boolean;
}

interface PageProps {
    outlet: Outlet;
}

export default function Edit({ outlet }: PageProps) {
    return <OutletForm outlet={outlet} />;
}
