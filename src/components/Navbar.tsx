import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Battery, ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { AuthModal } from './AuthModal';
import { CartSheet } from './CartSheet';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isStaff } = useAuth();
  const { getCartCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all group-hover:shadow-primary/40 group-hover:scale-105">
                <Battery className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Digit<span className="text-primary">Battery</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                Home
              </Link>
              <Link to="/collections" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                Collections
              </Link>
              <a href="#about" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                About
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {isStaff && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              {user && (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => setCartOpen(true)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-in zoom-in-50"
                        variant="default"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 bg-muted/50 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium max-w-[120px] truncate">{profile?.full_name || user.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={signOut} className="hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20">
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
            <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-1">
                <Link 
                  to="/" 
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/collections" 
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Collections
                </Link>
                <a 
                  href="#about" 
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                {user && (
                  <Link 
                    to="/profile" 
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
                {isStaff && (
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors"
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
