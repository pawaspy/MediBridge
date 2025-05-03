import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Register from './pages/Register'
import Login from './pages/Login'
import MainWebsite from './pages/MainWebsite'
import CategoryView from './pages/CategoryView'
import Cart from './pages/Cart'
import Healia from './pages/Healia'
import UserProfile from './pages/UserProfile'
import PatientProfile from './pages/PatientProfile'
import SellerDashboard from './pages/SellerDashboard'
import SearchResults from './pages/SearchResults'
import ProductDetail from './pages/ProductDetail'

// Check authentication for protected routes
const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');
  if (!userData) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PatientRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');
  if (!userData) return <Navigate to="/" replace />;
  const { role } = JSON.parse(userData);
  if (role !== 'patient') return <Navigate to="/main" replace />;
  return children;
};

// Layout component to handle navbar and scroll reset
const Layout = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative z-10 min-h-screen">
      <main className="pb-12 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/services", element: <Services /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      {
        path: "/main",
        element: (
          <ProtectedRoute>
            <MainWebsite />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category/:category",
        element: (
          <ProtectedRoute>
            <CategoryView />
          </ProtectedRoute>
        ),
      },
      {
        path: "/search",
        element: (
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        ),
      },
      {
        path: "/product/:id",
        element: (
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/healia",
        element: (
          <ProtectedRoute>
            <Healia />
          </ProtectedRoute>
        ),
      },
      { path: "/cart", element: (
        <PatientRoute>
          <Cart />
        </PatientRoute>
      ) },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/patient-profile",
        element: (
          <ProtectedRoute>
            <PatientProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/seller-dashboard",
        element: (
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
