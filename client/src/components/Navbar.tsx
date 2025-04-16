import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { path: "/products", label: "Products" },
    { path: "/place-order", label: "Place Order" },
    { path: "/track-order", label: "Track Order" },
    { path: "/admin", label: "Admin", isAdmin: true }
  ];

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="font-heading font-bold text-xl cursor-pointer">FreshBulk</span>
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`px-3 py-2 rounded-md text-sm font-medium 
                  ${location === link.path ? 'bg-primary-dark' : 'hover:bg-primary-dark'} 
                  ${link.isAdmin ? 'bg-secondary hover:bg-secondary-dark' : ''}`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`block px-3 py-2 rounded-md text-base font-medium 
                  ${location === link.path ? 'bg-primary-dark' : 'hover:bg-primary-dark'} 
                  ${link.isAdmin ? 'bg-secondary hover:bg-secondary-dark' : ''}`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
