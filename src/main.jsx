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
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import CategoryList from './components/category/CategoryList';
import './styles/global.css';
import Body from './components/body';
import ErrorPage from './pages/ErrorPage';
import { AuthWrapper } from './components/context/auth-context';
import { CartProvider } from './components/context/cart-context.jsx';
import PrivateRoute from './pages/private-route';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BankTransferPage from './pages/BankTransferPage';
import OrderPage from './pages/OrderPage';
import CategoryBooksPage from './pages/CategoryBooksPage';
import BooksPage from './pages/BooksPage';
import ShipperOrdersPage from './pages/ShipperOrdersPage';
import ReportsPage from './pages/ReportsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import UserReviewsPage from './pages/UserReviewsPage';
import './components/review/review.css';

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
            <BooksPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/categories',
        element: (
          <PrivateRoute>
            <CategoryList />
          </PrivateRoute>
        ),
      },
      {
        path: '/categories/:categoryId',
        element: (
          <PrivateRoute>
            <CategoryBooksPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/category/:categoryId',
        element: <CategoryBooksPage />,
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
      {
        path: '/bank-transfer',
        element: (
          <PrivateRoute>
            <BankTransferPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <PrivateRoute>
            <OrderPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/shipper/orders',
        element: (
          <PrivateRoute requiredRole="ROLE_SHIPPER">
            <ShipperOrdersPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/reports',
        element: (
          <PrivateRoute requiredRole="ROLE_ADMIN">
            <ReportsPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/admin/reviews',
        element: (
          <PrivateRoute requiredRole="ROLE_ADMIN">
            <AdminReviewsPage />
          </PrivateRoute>
        ),
      },
      {
        path: '/my-reviews',
        element: (
          <PrivateRoute>
            <UserReviewsPage />
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
