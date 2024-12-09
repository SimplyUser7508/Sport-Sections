import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/UseAuth";

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.accessToken
            ? <Outlet />
            : <Navigate to="/auth/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;