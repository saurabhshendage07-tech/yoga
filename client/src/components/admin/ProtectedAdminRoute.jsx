import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function ProtectedAdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Loading authentication state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#2D4A3E]/20 border-t-[#2D4A3E] animate-spin" />
            <div className="absolute inset-2 rounded-full bg-[#FAF8F5] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C59B63] animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-[#55695C] font-serif tracking-wide">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not admin -> Show Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBF9F5]">
        <div className="bg-white p-8 rounded-3xl border border-[#E1DBD1] max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#24362C]">Access Restricted</h2>
          <p className="text-xs text-[#6A7E72] leading-relaxed">
            Your account ({user.email}) does not possess studio administrator privileges. Only authorized managers may access this console.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="w-full py-2.5 rounded-full bg-[#2D4A3E] text-white text-xs font-semibold hover:bg-[#233B2B] transition"
            >
              Go to Student Dashboard
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-full bg-gray-100 text-[#24362C] text-xs font-medium hover:bg-gray-200 transition"
            >
              Return to Website Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin -> Allow access
  return <Outlet />;
}
