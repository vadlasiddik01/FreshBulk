import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Public links available to all users
  const publicLinks = [
    { path: "/products", label: "Products" },
    { path: "/track-order", label: "Track Order" },
  ];

  // Links that require authentication
  const authLinks = [
    { path: "/place-order", label: "Place Order" },
  ];

  // Admin-only links
  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard" },
  ];

  // Determine which links to show based on authentication status
  const navLinks = [
    ...publicLinks,
    ...(user ? authLinks : []),
    ...(user && user.role === "admin" ? adminLinks : []),
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
              <Link 
                key={link.path} 
                href={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium 
                  ${location === link.path ? 'bg-primary-dark' : 'hover:bg-primary-dark'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-default">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button 
                  variant="secondary" 
                  className="ml-2"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full mr-2">
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-default">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
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
              <Link 
                key={link.path} 
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium 
                  ${location === link.path ? 'bg-primary-dark' : 'hover:bg-primary-dark'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {!user && (
              <Link 
                href="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-secondary hover:bg-secondary-dark"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
