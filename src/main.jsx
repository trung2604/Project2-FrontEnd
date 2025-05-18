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
const Router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Body />,
      },
      {
        path: '/users',
        element: <UsersPage />,
      },
      {
        path: '/books',
        element: <BookPage />,
      }
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
  <StrictMode>
    <RouterProvider router={Router} />
  </StrictMode>,
)
