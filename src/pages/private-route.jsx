import { useContext } from "react";
import { AuthContext } from "../components/context/auth-context";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";

const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (user && user.id) {
        return children;
    }
    return <Navigate to="/login" replace />;
}

export default PrivateRoute;