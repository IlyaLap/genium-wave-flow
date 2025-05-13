
import React from 'react';
import { SplashCursor } from '../components/SplashCursor';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubsidiaryCard from '../components/SubsidiaryCard';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-black text-white">
      {/* Background Fluid Animation */}
      <SplashCursor />
      
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center z-10 pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Subsidiaries Section */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-center">Our Subsidiaries</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Genium Sites Card */}
              <SubsidiaryCard 
                title="Genium Sites" 
                description="Genium Sites builds modern, high-converting websites with foundational SEO and clear value messaging. Enjoy fair pricing, fast turnaround, and a seamless development process—your trusted partner for web solutions."
                logoSrc="/lovable-uploads/02cba418-ba71-4ca8-af4e-ab16725a8790.png"
                url="https://geniumsites.com"
              />
              
              {/* IVL Consulting Card */}
              <SubsidiaryCard 
                title="IVL Consulting" 
                description="IVL Consulting creates transformative Go-To-Market motions, with a clear 4-stage process of mapping, building, running and documenting the GTM function - your trusted partner for GTM engineering."
                logoSrc="/lovable-uploads/2521426c-4675-4bf0-9c47-54b3d43f2547.png"
                url="https://ivl-consulting.com"
              />
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
