'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Check, 
  Play, 
  MousePointer2,
  Mic,
  Wand2,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Code2,
  Layers
} from 'lucide-react';

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

// Typing animation component
function TypedText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const current = texts[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < current.length) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 80);
    
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, texts]);
  
  return (
    <span className="gradient-text">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      style={{ 
        animation: `float 8s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    />
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  gradient: string;
  delay: number;
}) {
  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
      
      <div className="relative h-full p-6 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-border-subtle hover:border-accent/30 transition-all duration-500 hover:-translate-y-2">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-bg-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Stats component
function StatItem({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const count = useCounter(value);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-text-secondary text-sm">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        
        {/* Floating orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-accent top-[-200px] left-[-200px]" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-violet top-[20%] right-[-150px]" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bg-warm bottom-[10%] left-[10%]" delay={4} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border-subtle backdrop-blur-xl bg-bg-primary/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <Sparkles className="w-5 h-5 text-bg-primary" />
                <div className="absolute inset-0 rounded-xl bg-gradient-teal opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
              </div>
              <span className="text-2xl font-bold text-text-primary">
                Narrify
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-text-secondary hover:text-accent transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-text-secondary hover:text-accent transition-colors">
                How it works
              </Link>
              <Link href="#pricing" className="text-text-secondary hover:text-accent transition-colors">
                Pricing
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <a
                href="mailto:sales@narrify.com"
                className="btn-primary flex items-center gap-2"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="animate-fade-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </div>
                <span className="text-sm font-medium text-accent">
                  Powered by Claude Vision AI
            </span>
          </div>

          {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-text-primary">Tours that</span>
            <br />
                <TypedText texts={['actually see', 'understand UI', 'adapt visually', 'feel human']} />
          </h1>

          {/* Subheading */}
              <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-xl">
                The first AI tour platform that navigates by vision, not brittle selectors. 
                Create interactive experiences that understand your UI like a human does.
          </p>

          {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="mailto:sales@narrify.com"
                  className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-3 group"
            >
                  <span>Contact Sales</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
                <button className="btn-secondary px-8 py-4 text-lg flex items-center justify-center gap-3 group">
              <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
            </button>
          </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
              <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>5 min setup</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Demo */}
            <div className="relative animate-fade-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {/* Browser mockup */}
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-accent via-violet to-warm rounded-2xl blur-xl opacity-30" />
                
                <div className="relative bg-bg-secondary border border-border rounded-2xl overflow-hidden">
                  {/* Browser header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-tertiary">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-warm/80" />
                      <div className="w-3 h-3 rounded-full bg-warning/80" />
                      <div className="w-3 h-3 rounded-full bg-accent/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-bg-elevated rounded-lg px-4 py-1.5 text-xs text-text-tertiary flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        yourapp.com/dashboard
                      </div>
                    </div>
                  </div>
                  
                  {/* Browser content - Simulated UI */}
                  <div className="p-6 min-h-[400px] relative">
                    {/* Fake dashboard UI */}
                    <div className="space-y-4">
                      <div className="h-8 w-32 bg-bg-tertiary rounded-lg" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-24 bg-bg-tertiary rounded-xl" />
                        <div className="h-24 bg-bg-tertiary rounded-xl" />
                        <div className="h-24 bg-bg-tertiary rounded-xl" />
                      </div>
                      <div className="h-48 bg-bg-tertiary rounded-xl" />
                    </div>
                    
                    {/* Narrify spotlight overlay */}
                    <div className="absolute top-16 left-4 right-4 pointer-events-none">
                      {/* Spotlight effect */}
                      <div className="absolute top-0 left-0 w-32 h-28 rounded-xl border-2 border-accent shadow-glow animate-pulse-glow" />
                      
                      {/* Tooltip */}
                      <div className="absolute top-32 left-0 bg-bg-elevated border border-accent/30 rounded-xl p-4 shadow-glow max-w-xs animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-teal flex items-center justify-center flex-shrink-0">
                            <Eye className="w-4 h-4 text-bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-text-primary font-medium mb-1">
                              This is your analytics card
                            </p>
                            <p className="text-xs text-text-secondary">
                              Click here to view detailed metrics about your users.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                          <button className="text-xs text-accent font-medium flex items-center gap-1">
                            <Mic className="w-3 h-3" />
                            Ask a question
                          </button>
                          <span className="text-text-tertiary text-xs">•</span>
                          <button className="text-xs text-text-secondary flex items-center gap-1">
                            Next
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vision cursor */}
                    <div className="absolute top-20 left-16 animate-float">
                      <MousePointer2 className="w-6 h-6 text-accent drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 170, 0.5))' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-bg-elevated border border-border rounded-xl px-4 py-2 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet" />
                  <span className="text-sm font-medium text-text-primary">AI Generated</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-bg-elevated border border-border rounded-xl px-4 py-2 shadow-lg animate-float-slow">
            <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-text-primary">Vision-First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-6 border-y border-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={10000} label="Tours Created" suffix="+" />
            <StatItem value={98} label="Completion Rate" suffix="%" />
            <StatItem value={500} label="Companies Trust Us" suffix="+" />
            <StatItem value={50} label="Countries" suffix="+" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="badge mb-4">Features</div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Everything you need to create{' '}
              <span className="gradient-text">magical tours</span>
            </h2>
            <p className="text-xl text-text-secondary">
              Built from the ground up with AI at its core. No more brittle CSS selectors or manual maintenance.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Eye}
              title="Vision-First Navigation"
              description="Powered by Claude Vision, Narrify actually sees your UI. Navigate elements visually, not with fragile selectors."
              gradient="bg-gradient-teal"
              delay={0}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Conversational AI"
              description="Users can pause and ask questions anytime. Our AI responds with full context of what they're looking at."
              gradient="bg-gradient-violet"
              delay={0.1}
            />
            <FeatureCard
              icon={Mic}
              title="Voice Interaction"
              description="Natural voice input and output. Users speak, Narrify listens and responds like a real product expert."
              gradient="bg-gradient-warm"
              delay={0.2}
            />
            <FeatureCard
              icon={Wand2}
              title="AI-Generated Tours"
              description="Describe what you want in plain English. Our AI builds the entire tour automatically in seconds."
              gradient="bg-gradient-teal"
              delay={0.3}
            />
            <FeatureCard
              icon={Layers}
              title="Smart Adaptation"
              description="Tours adapt automatically when your UI changes. No more broken tours after every deployment."
              gradient="bg-gradient-violet"
              delay={0.4}
            />
            <FeatureCard
              icon={Code2}
              title="One Line Integration"
              description="Add Narrify to any website with a single script tag. No complex setup or build configuration."
              gradient="bg-gradient-warm"
              delay={0.5}
            />
          </div>
              </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="badge mb-4">How it works</div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              From zero to live in{' '}
              <span className="gradient-text">5 minutes</span>
            </h2>
            <p className="text-xl text-text-secondary">
              No coding required. Just describe what you want and let AI do the heavy lifting.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Describe Your Tour',
                description: 'Tell our AI what you want to show users. Paste your URL and goals.',
                icon: MessageSquare
              },
              {
                step: '02',
                title: 'AI Builds It',
                description: 'Claude Vision analyzes your UI and creates a complete tour automatically.',
                icon: Wand2
              },
              {
                step: '03',
                title: 'Go Live',
                description: 'Copy one script tag to your site. Tours adapt as your UI changes.',
                icon: Zap
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent/50 to-transparent" />
                )}
                
                <div className="relative p-8 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-accent/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl font-bold text-accent/20">{item.step}</div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-secondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 py-20 px-6 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-text-tertiary mb-10">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Slack'].map((company) => (
              <div key={company} className="text-2xl font-bold text-text-tertiary">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-violet/20 to-warm/20 blur-3xl" />
            
            <div className="relative p-12 md:p-16 rounded-3xl bg-bg-secondary border border-border text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Start for free today</span>
          </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                Ready to transform your{' '}
                <span className="gradient-text">user onboarding?</span>
            </h2>
              
              <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
                Join thousands of companies using Narrify to create engaging, 
                AI-powered product tours that users actually complete.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:sales@narrify.com"
                  className="btn-primary px-10 py-4 text-lg flex items-center justify-center gap-3 group"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <button
                  className="btn-secondary px-10 py-4 text-lg"
                >
                  Watch Demo
            </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-bg-primary" />
                </div>
                <span className="text-2xl font-bold text-text-primary">Narrify</span>
              </Link>
              <p className="text-text-secondary max-w-md mb-6">
                The first AI tour platform powered by Claude Vision. 
                Create interactive experiences that understand your UI visually.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-accent hover:border-accent/30 transition-all">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-text-secondary hover:text-accent transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-text-secondary hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">About</Link></li>
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-text-secondary hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-tertiary text-sm">
              © 2026 Narrify. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-text-tertiary">
              <Link href="#" className="hover:text-accent transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-accent transition-colors">Terms</Link>
              <Link href="#" className="hover:text-accent transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
