
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SplashCursor } from '../components/SplashCursor';

const About = () => {
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
        <div className="container mx-auto px-4 max-w-4xl">
          <section className="bg-black bg-opacity-40 backdrop-blur-md rounded-lg p-8 border border-gray-800">
            <h1 className="text-4xl font-bold mb-6">About <span className="text-genium-purple">Genium Group</span></h1>
            
            <div className="space-y-6">
              <p className="text-gray-300">
                Founded in 2015, Genium Group has established itself as a leader in digital innovation and business solutions. We combine cutting-edge technology with strategic thinking to deliver exceptional results for our clients across various industries.
              </p>
              
              <p className="text-gray-300">
                Our mission is to empower organizations through technology, helping them adapt to the rapidly changing digital landscape and stay ahead of the competition.
              </p>
              
              <h2 className="text-2xl font-semibold text-genium-purple mt-8 mb-4">Our Approach</h2>
              <p className="text-gray-300">
                At Genium Group, we believe in a collaborative approach that puts our clients' needs at the center of everything we do. We work closely with each client to understand their unique challenges and develop tailored solutions that drive real business value.
              </p>
              
              <h2 className="text-2xl font-semibold text-genium-purple mt-8 mb-4">Our Team</h2>
              <p className="text-gray-300">
                Our team consists of industry experts, creative thinkers, and technical specialists who are passionate about innovation and excellence. Together, we bring a wealth of experience and diverse perspectives to every project.
              </p>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
