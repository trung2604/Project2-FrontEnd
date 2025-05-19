import { createContext, useState } from "react";

const AuthContext = createContext({
    id: '',
    fullName: '',
    email: '',
    role: '',
    phone: '',
    avatar: ''
});

const AuthWrapper = ({ children }) => {
    const [user, setUser] = useState({
        id: '',
        fullName: '',
        email: '',
        role: '',
        phone: '',
        avatar: ''
    })
    const [isLoading, setIsLoading] = useState(true);
    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
export { AuthContext, AuthWrapper };

