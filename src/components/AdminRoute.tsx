import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export const AdminRoute = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Check if user is logged in AND is an admin
    if (!user || !isAdmin) {
        // Redirect to home if not authorized
        // We could also redirect to a specific "Unauthorized" page
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
