
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SplashCursor } from "../components/SplashCursor";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col relative bg-black text-white">
      {/* Background Fluid Animation */}
      <SplashCursor />
      
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center z-10 pt-24 pb-16">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-300 mb-8">Oops! Page not found</p>
          <Link to="/" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300">
            Return to Home
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
