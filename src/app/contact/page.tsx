
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Youtube, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const recipientEmail = "mnadeemsabri@gmail.com";
  const subject = "Contact Form Inquiry from Passion Academia";

  const generateMailtoLink = () => {
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <div className="bg-muted/40 text-foreground py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            CONTACT US
          </h1>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Leave us a message</h2>
               <form className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="First Name Last Name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required className="min-h-[120px]" />
                </div>
                 <Button asChild size="lg" className="w-full">
                    <a href={generateMailtoLink()}>
                        Send
                    </a>
                </Button>
              </form>
            </div>
            
            <div className="bg-muted/50 p-8 rounded-r-lg">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Passion Academia</h3>
                        <p className="text-muted-foreground mt-2">
                            Mohallah Sabri Malakwal Disst Mandi Bha Ud DIn Pakistan
                        </p>
                    </div>
                     <div>
                        <a href="tel:+923466451291" className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                            <Phone className="h-5 w-5" />
                            <span>+92 346 6451291</span>
                        </a>
                    </div>
                     <div>
                        <a href={`mailto:${recipientEmail}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                            <Mail className="h-5 w-5" />
                            <span>{recipientEmail}</span>
                        </a>
                    </div>

                    <div className="flex space-x-4">
                        <Button asChild variant="outline" size="icon" className="transition-transform duration-300 hover:scale-110">
                            <a href="https://www.youtube.com/@GHSMalakwalByNadeemSabri" aria-label="YouTube">
                            <Youtube className="h-5 w-5" />
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="icon" className="transition-transform duration-300 hover:scale-110">
                            <a href="https://www.instagram.com/sabri_hit/" aria-label="Instagram">
                            <Instagram className="h-5 w-5" />
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="icon" className="transition-transform duration-300 hover:scale-110">
                            <a href="#" aria-label="Facebook">
                            <Facebook className="h-5 w-5" />
                            </a>
                        </Button>
                         <Button asChild variant="outline" size="icon" className="transition-transform duration-300 hover:scale-110">
                            <a href="#" aria-label="Twitter">
                            <Twitter className="h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                     <div className="relative h-48 w-full rounded-md overflow-hidden">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full border-0"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.215582218453!2d73.2109049755452!3d32.5514488738362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3921379563212871%3A0x19934adce8537553!2sMohallah%20Sabri!5e0!3m2!1sen!2s!4v1721999999999!5m2!1sen!2s"
                        ></iframe>
                    </div>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
