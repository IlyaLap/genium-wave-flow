
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SplashCursor from '../components/SplashCursor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // In a real implementation, this would send the form data to a server
    toast({
      title: "Message Sent",
      description: "Thank you for reaching out. We'll get back to you soon!",
      duration: 5000,
    });
    
    // Reset form
    e.currentTarget.reset();
  };
  
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
            <h1 className="text-4xl font-bold mb-6">Contact <span className="text-genium-purple">Us</span></h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                <p className="text-gray-300 mb-6">
                  Have questions or want to discuss how Genium Group can help your business? Reach out to us using the form or contact details below.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-genium-purple font-medium">Email</h3>
                    <p className="text-gray-300">info@geniumgroup.com</p>
                  </div>
                  
                  <div>
                    <h3 className="text-genium-purple font-medium">Phone</h3>
                    <p className="text-gray-300">+1 (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h3 className="text-genium-purple font-medium">Address</h3>
                    <p className="text-gray-300">
                      123 Tech Boulevard<br />
                      Suite 456<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-1">Name</label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      required 
                      className="bg-gray-900 border-gray-700 focus:border-genium-purple"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-1">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      required 
                      className="bg-gray-900 border-gray-700 focus:border-genium-purple"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-300 mb-1">Message</label>
                    <Textarea 
                      id="message" 
                      placeholder="How can we help you?" 
                      required 
                      className="bg-gray-900 border-gray-700 focus:border-genium-purple min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-genium-purple hover:bg-genium-purple-light text-white transition-colors"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
