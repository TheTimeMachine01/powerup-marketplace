import React from 'react';
import { Link } from 'react-router-dom';
import { Battery, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-foreground dark:bg-card text-background dark:text-foreground py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary">
                <Battery className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold dark:text-foreground">
                Digit<span className="text-primary">Infotech</span>
              </span>
            </div>
            <p className="text-background/70 dark:text-muted-foreground text-sm">
              Your trusted partner for quality automotive batteries. Powering vehicles across India since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4 dark:text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70 dark:text-muted-foreground">
              <li><Link to="/collections" className="hover:text-primary transition-colors">Our Collection</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Exchange Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Warranty Info</Link></li>
            </ul>
          </div>

          {/* Vehicle Types */}
          <div>
            <h4 className="font-display font-semibold mb-4 dark:text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm text-background/70 dark:text-muted-foreground">
              <li><Link to="/collections" className="hover:text-primary transition-colors">Car Batteries</Link></li>
              <li><Link to="/collections" className="hover:text-primary transition-colors">Bike Batteries</Link></li>
              <li><Link to="/collections" className="hover:text-primary transition-colors">Inverter Batteries</Link></li>
              <li><Link to="/collections" className="hover:text-primary transition-colors">Commercial Vehicles</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4 dark:text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm text-background/70 dark:text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@digitinfotech.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Digit Infotech, Main Market, Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 dark:border-secondary/30 mt-12 pt-8 text-center text-sm text-background/50 dark:text-muted-foreground/60">
          <p>© {new Date().getFullYear()} Digit Infotech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
