import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Battery, ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { AuthModal } from './AuthModal';
import { CartSheet } from './CartSheet';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isStaff } = useAuth();
  const { getCartCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-primary transition-transform group-hover:scale-105">
                <Battery className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Digit<span className="text-primary">Battery</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Products
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isStaff && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              {user && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      variant="default"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile?.full_name || user.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-3">
                <Link 
                  to="/" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <a 
                  href="#products" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </a>
                <a 
                  href="#about" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                {isStaff && (
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};
