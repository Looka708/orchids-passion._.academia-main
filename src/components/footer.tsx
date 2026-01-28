import Link from "next/link";
import Logo from "./logo";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3" prefetch={false}>
              <Logo />
              <span className="text-2xl font-black tracking-tighter">PASSION<span className="text-primary italic">ACADEMIA</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Fueling ambition through excellence in education. We provide the tools and guidance for students to achieve their highest academic and career goals.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-primary">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/#courses" className="text-muted-foreground hover:text-primary transition-colors">Programs</Link></li>
              <li><Link href="/#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-primary">Special Programs</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/afns" className="text-muted-foreground hover:text-primary transition-colors">AFNS Prep</Link></li>
              <li><Link href="/paf" className="text-muted-foreground hover:text-primary transition-colors">PAF Cadet</Link></li>
              <li><Link href="/mcj" className="text-muted-foreground hover:text-primary transition-colors">MCJ Entrance</Link></li>
              <li><Link href="/mcm" className="text-muted-foreground hover:text-primary transition-colors">MCM Entrance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-primary">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground">Office 12, Education Hub, Main Blvd, City Center</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground">+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground">support@passion-academia.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Passion Academia. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
