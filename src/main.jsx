import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import App from './App';
import BookPage from './pages/BookPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import './styles/global.css';
import Body from './components/body';
import ErrorPage from './pages/ErrorPage';
import { AuthWrapper } from './components/context/auth-context';
import { CartProvider } from './components/context/cart-context.jsx';
import PrivateRoute from './pages/private-route';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Wrap App with CartProvider
const AppWithCart = () => (
  <CartProvider>
    <App />
  </CartProvider>
);

const Router = createBrowserRouter([
  {
    path: '/',
    element: <AppWithCart />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Body />,
      },
      {
        path: '/users',
        element: (
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/books',
        element: (
          <PrivateRoute>
            <BookPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/cart',
        element: (
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/checkout',
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  }
])

createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <RouterProvider router={Router} />
  </AuthWrapper>
)
