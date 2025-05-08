
import React from 'react';
import SplashCursor from '../components/SplashCursor';
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
      <main className="flex-grow flex items-center justify-center z-10 py-24">
        <div className="container mx-auto px-4">
          {/* Subsidiaries Section */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-center">Our Subsidiaries</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Genium Sites Card */}
              <SubsidiaryCard 
                title="Genium Sites" 
                description="Specializing in web development and digital experiences, Genium Sites creates stunning, responsive websites optimized for performance and user engagement. Our approach combines aesthetic design with technical excellence."
                logoSrc="/placeholder.svg"
                url="https://geniumsites.com"
              />
              
              {/* IVL Consulting Card */}
              <SubsidiaryCard 
                title="IVL Consulting" 
                description="Offering strategic business consulting and digital transformation services, IVL Consulting helps organizations navigate complex challenges and unlock new opportunities through innovative technology solutions."
                logoSrc="/placeholder.svg"
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
