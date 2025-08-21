'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useToast } from '@/components/ui/Toast';
import {Upload, Calendar, MapPin, Shield, Zap, Users, Play, CheckCircle, ArrowRight, Chrome} from 'lucide-react';
import {Logo} from "@/components/ui/Logo";

// For a complex page like this, creating small, local components is a great way to keep the main return statement clean.
const FeatureCard = ({ icon: Icon, title, description, iconContainerClass, iconClass }) => (
    <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-border">
        <CardContent className="pt-8 pb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${iconContainerClass}`}>
                <Icon className={`w-8 h-8 ${iconClass}`} />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
    </Card>
);

const BenefitItem = ({ icon: Icon, title, description, iconContainerClass, iconClass }) => (
    <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconContainerClass}`}>
            <Icon className={`w-6 h-6 ${iconClass}`} />
        </div>
        <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);


export default function Home() {
  // --- NEW: Get the addToast function from the hook ---
  const { addToast } = useToast();

  // --- NEW: Use useEffect to show the toast once when the component mounts ---
  useEffect(() => {
    const hasShownToast = sessionStorage.getItem('theme_toast_shown');
    if (!hasShownToast) {
      addToast({
        type: 'info',
        title: 'Light & Dark Mode Enabled!',
        message: 'You can switch themes using the button in the navbar.',
        duration: 6000, // 6 seconds
      });
      sessionStorage.setItem('theme_toast_shown', 'true');
    }
  }, [addToast]); // Dependency array ensures this runs only once

  return (
    // THEME: Use theme background.
    <main className="min-h-screen bg-background">
      {/* Header */}
      {/* THEME: Use theme card styles for the header. */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/*<Image
                src="/Hapo Logo.svg"
                alt="Hapo Media"
                width={48}
                height={48}
                className="w-12 h-12"
              />*/}
                <Logo className="w-12 h-12" />
              <div>
                {/* THEME: Use theme text colors. */}
                <h1 className="text-2xl font-bold text-foreground">Hapo Media</h1>
                <p className="text-sm text-muted-foreground">Content Hub</p>
              </div>
        </div>
            <div className="flex items-center gap-3">
                {/* --- CHANGE: Added the ThemeSwitcher here --- */}
                <ThemeSwitcher />
                <Link href="/auth/client/signin">
                <Button variant="outline" size="sm">
                  <Chrome className="w-4 h-4 mr-2" />
                  Client Login
                </Button>
                </Link>
              </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* THEME: Use a subtle theme-aware gradient. */}
      <section className="bg-gradient-to-br from-background via-accent/20 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The Central Hub for Your
              {/* THEME: Use theme primary color for the highlight. */}
              <span className="text-primary block">Digital Signage Content</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Clients can easily upload media, and our team can deploy it faster than ever.
              Streamline your advertising campaigns with our comprehensive content management system
              designed for modern marketing teams.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/client/signin">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                  <Chrome className="w-5 h-5 mr-2" />
                  Get Started - Client Portal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
               {/* <Link href="/auth/admin/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </Button>
                </Link>*/}
            </div>
          </div>
              </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Content Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make content upload and deployment seamless for both clients and marketing teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Using the sub-component for cleaner code */}
            <FeatureCard
                icon={Upload}
                title="Easy Drag-and-Drop Uploads"
                description="Upload images, videos, and audio files with a simple drag-and-drop interface.
                  No technical knowledge required."
                iconContainerClass="bg-primary/10"
                iconClass="text-primary" />
            <FeatureCard
                icon={Calendar}
                title="Schedule Your Content"
                description="Set start and end dates, create recurring campaigns, and manage your content timeline
                  with precision."
                iconContainerClass="bg-green-500/10"
                iconClass="text-green-500" />
            <FeatureCard
                icon={MapPin}
                title="Manage All Your Locations"
                description=" Organize content by store locations and brands. Perfect for multi-location
                  businesses and franchises."
                iconContainerClass="bg-purple-500/10"
                iconClass="text-purple-500" />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {/* THEME: Use theme-aware background. */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how easy it is to upload and manage your digital signage content.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Client Dashboard Preview */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                  <Users className="w-6 h-6 text-primary mr-2" />
                Client Dashboard
              </h3>
              {/* THEME: Themed the preview card. */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                      <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-primary font-medium">
                          Client Dashboard Demo
                      </p>
                      <p className="text-primary/80 text-sm">
                          Upload & Schedule Content
                      </p>
                  </div>
                </div>
                <div className="p-6">
                    <h4 className="font-semibold text-foreground mb-3">
                    Key Features:
                    </h4>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Intuitive file upload interface</li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Campaign scheduling tools
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Store location management
                    </li>
                  </ul>
                </div>
              </Card>
              </div>
            {/* Admin Dashboard Preview */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                  <Shield className="w-6 h-6 text-green-500 mr-2" />
                Admin Dashboard
              </h3>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center">
                  <div className="text-center">
                      <Play className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-green-600 dark:text-green-400 font-medium">
                          Admin Dashboard Demo
                      </p>
                      <p className="text-green-600/80 dark:text-green-400/80 text-sm">
                          Organize & Deploy Content
                      </p>
                  </div>
                </div>
                <div className="p-6">
                    <h4 className="font-semibold text-foreground mb-3">
                        Admin Tools:
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Centralized content library
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Client management tools
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Bulk download capabilities
                    </li>
                </ul></div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Why Choose Hapo Media?
              </h2>
                    <p className="text-xl text-muted-foreground">
                Built for modern marketing teams who need speed, security, and simplicity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <BenefitItem
                    icon={Zap}
                    title="Lightning Fast Deployment"
                    description="From upload to deployment in minutes, not hours."
                    iconContainerClass="bg-primary/10"
                    iconClass="text-primary"
                />
                <BenefitItem
                    icon={Shield}
                    title="Enterprise Security"
                    description="Role-based access control and secure file storage keep your content safe."
                    iconContainerClass="bg-green-500/10"
                    iconClass="text-green-500"
                />
                <BenefitItem
                    icon={Users}
                    title="Client-Friendly Interface"
                    description="No training required. An intuitive interface designed for non-technical users."
                    iconContainerClass="bg-purple-500/10"
                    iconClass="text-purple-500"
                />
                <BenefitItem
                    icon={MapPin}
                    title="Multi-Location Support"
                    description="Perfect for franchises. Organize content by location, brand, and campaign."
                    iconContainerClass="bg-orange-500/10"
                    iconClass="text-orange-500"
                />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* THEME: Themed the CTA section. It's okay to have a specific gradient here. */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
                Ready to Streamline Your Content?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Join marketing teams who trust Hapo Media Content Hub for their digital signage needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/client/signin">
                  <Button
                      size="lg"
                      variant="secondary"
                      className="w-full sm:w-auto px-8 py-4 text-lg">
                  <Chrome className="w-5 h-5 mr-2" />
                  Start as Client
                </Button>
            </Link>
              <Link href="/auth/admin/signin">
                <Button
                size="lg"
                variant="outline"
                      className="w-full sm:w-auto px-8 py-4 text-lg border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Access
                </Button>
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* THEME: Themed the footer. */}
      <footer className="bg-muted/20 text-muted-foreground py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">

                  <Logo className="w-12 h-12" />
                <div>
                    <h3 className="text-xl font-bold text-foreground">
                        Hapo Media
                    </h3>
                    <p className="text-sm">
                        Content Hub
                    </p>
                </div>
              </div>
              <p className="max-w-md">
                  The central hub for your digital signage content. Streamline your advertising campaigns with our comprehensive content management system.
              </p>
          </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">
                  Product
              </h4>
              <ul className="space-y-2">
                  <li className="hover:text-foreground transition-colors">
                      <Link href="/auth/client/signin">
                          Client Portal
                      </Link>
                  </li>
                  <li className="hover:text-foreground transition-colors">
                      <Link href="/auth/admin/signin">
                          Admin Dashboard
                      </Link>
                  </li>
                  <li className="hover:text-foreground transition-colors">
                      <Link href="#features">
                          Features
                      </Link>
                  </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                  <li className="hover:text-foreground transition-colors">
                      <Link href="/privacy">Privacy Policy</Link>
                  </li>
                  <li className="hover:text-foreground transition-colors">
                      <Link href="/terms">Terms of Service</Link>
                  </li>
                  <li className="hover:text-foreground transition-colors">
                  <a href="mailto:support@hapogroup.co.za">
                  Contact Support</a>
              </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p>
              © 2024 Hapo Media. All rights reserved. |
              <span className="ml-2">Secure • Reliable • Professional</span>
          </p>
        </div>
        </div>
      </footer>
    </main>
  );
}