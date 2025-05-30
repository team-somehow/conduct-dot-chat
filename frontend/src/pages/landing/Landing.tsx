import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Code,
  Database,
  Search,
  Globe,
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
        <a
          href="/"
          className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2"
        >
          <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>MakeChat.dev</span>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="ghost">
            Log in
          </Button>
          <Button>Sign up</Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border lg:hidden">
            <nav className="flex flex-col space-y-4 p-4">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                GitHub
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start">
                  Log in
                </Button>
                <Button className="justify-start">Sign up</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Animated typing for URL input demonstration
const TypingDemo = () => {
  const urls = [
    "docs.reactjs.org",
    "openai.com",
    "news.ycombinator.com",
    "github.com",
  ];
  const [displayedText, setDisplayedText] = useState("");
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (isFocused) return;
    const targetUrl = urls[currentUrlIndex];
    if (isTyping) {
      if (displayedText !== targetUrl) {
        const timeout = setTimeout(() => {
          setDisplayedText(targetUrl.substring(0, displayedText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        setTimeout(() => setIsTyping(false), 1500);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(
            displayedText.substring(0, displayedText.length - 1)
          );
        }, 60);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(true);
        setCurrentUrlIndex((currentUrlIndex + 1) % urls.length);
      }
    }
  }, [displayedText, currentUrlIndex, isTyping, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Navigate to create page with URL
      console.log("Creating chatbot for:", inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto relative">
      <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
        <div className="bg-card flex-grow rounded-l-lg border border-r-0 border-input px-3 py-3 text-sm flex items-center">
          <span className="text-muted-foreground">https://</span>
          <div className="relative flex-1">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !inputValue && setIsFocused(false)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-transparent"
              placeholder={isFocused ? "Enter website URL..." : displayedText}
            />
            {!isFocused && !inputValue && (
              <span
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-5 w-px bg-primary ${
                  showCursor ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              ></span>
            )}
          </div>
        </div>
        <Button type="submit" className="rounded-l-none px-6 py-6" size="lg">
          <span className="mr-2">Make Chat</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

// Feature card component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <Card className="overflow-hidden group border-border hover:border-primary/20 transition-all duration-300">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="rounded-full bg-primary/10 p-3 w-fit mb-5 group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="text-primary w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Step card for How It Works section
const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-start space-y-4 relative">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
      {number}
    </div>
    <div className="bg-card border border-border rounded-lg p-6 w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

// Testimonial component
const Testimonial = ({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) => (
  <Card className="border-border hover:border-primary/20 transition-all duration-300">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="mb-4 text-primary">
        <Star className="w-5 h-5 inline-block" />
        <Star className="w-5 h-5 inline-block" />
        <Star className="w-5 h-5 inline-block" />
        <Star className="w-5 h-5 inline-block" />
        <Star className="w-5 h-5 inline-block" />
      </div>
      <p className="text-foreground italic mb-6 flex-grow">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </CardContent>
  </Card>
);

// Pricing card component
const PricingCard = ({
  tier,
  price,
  description,
  features,
  isPopular = false,
}: {
  tier: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <Card
    className={`border ${
      isPopular ? "border-primary shadow-lg" : "border-border"
    } relative h-full flex flex-col`}
  >
    {isPopular && (
      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
        Most Popular
      </div>
    )}
    <CardContent className="p-6 flex-grow flex flex-col">
      <h3 className="text-lg font-medium mb-2">{tier}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Free" && (
          <span className="text-muted-foreground">/month</span>
        )}
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={isPopular ? "default" : "outline"}
        className="w-full mt-auto"
      >
        Get Started
      </Button>
    </CardContent>
  </Card>
);

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section id="hero" className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
                Turn Any Website Into a Chatbot in Seconds
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed">
                MakeChat.dev is a no-code platform that converts websites into
                conversational AI interfaces. Instantly deploy, customize, and
                share your chatbot.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
                <Button size="lg" className="font-medium text-base sm:text-lg px-6 sm:px-8">
                  Get Started for Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium text-base sm:text-lg px-6 sm:px-8"
                >
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-xl opacity-70"></div>
              <div className="relative bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Try it now:</h3>
                <TypingDemo />
                <div className="mt-6 sm:mt-8 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-4 sm:mb-6">
            TRUSTED BY INNOVATIVE COMPANIES
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 lg:gap-x-12 gap-y-4 sm:gap-y-6 lg:gap-y-8">
            {["Acme Inc", "Globex", "Soylent Corp", "Initech", "Umbrella"].map(
              (brand) => (
                <div
                  key={brand}
                  className="text-base sm:text-lg lg:text-xl font-semibold text-muted-foreground/70"
                >
                  {brand}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              Create your own AI chatbot in three simple steps - no coding
              required
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <StepCard
              number={1}
              title="Paste Your URL"
              description="Simply paste the URL of any website you want to create a chatbot for. No API keys or coding required."
            />
            <StepCard
              number={2}
              title="Customize Your Bot"
              description="Pick a name, tone, and sample questions to shape your chatbot's personality and behavior."
            />
            <StepCard
              number={3}
              title="Deploy & Share"
              description="Get a unique link to share your chatbot or embed it directly into your website with a simple code snippet."
            />
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Feature Highlights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              Everything you need to create powerful, intelligent chatbots
              without writing a single line of code.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={Zap}
              title="Instant Setup"
              description="Create a chatbot in under 60 seconds with our intuitive no-code interface. Just paste a URL and you're ready to go."
            />
            <FeatureCard
              icon={Database}
              title="Deep Website Crawling"
              description="Our advanced crawler captures your website's content completely for comprehensive and accurate responses."
            />
            <FeatureCard
              icon={Search}
              title="Semantic Search"
              description="Cutting-edge AI understands context and intent, delivering accurate responses to even complex user queries."
            />
            <FeatureCard
              icon={Code}
              title="Easy Integration"
              description="Embed your chatbot on any website with a simple code snippet or share via a dedicated link."
            />
            <FeatureCard
              icon={Shield}
              title="Privacy Focused"
              description="Your data stays private. We don't store user conversations or share sensitive information."
            />
            <FeatureCard
              icon={Globe}
              title="Multilingual Support"
              description="Communicate with users in multiple languages with automatic translation capabilities."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              Discover how MakeChat.dev is transforming customer support and
              engagement
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Testimonial
              quote="We implemented MakeChat on our documentation site and saw a 40% reduction in support tickets within the first month."
              author="Sarah Johnson"
              role="CTO at TechCorp"
            />
            <Testimonial
              quote="The setup was incredibly easy. Our marketing site now has 24/7 customer support without adding headcount."
              author="Michael Chen"
              role="Founder, StartupX"
            />
            <Testimonial
              quote="Our users love being able to get instant answers. The AI is surprisingly accurate and handles complex questions well."
              author="Emily Rodriguez"
              role="Product Manager at SaaS Inc."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              Choose the plan that works for your needs. All plans include core
              features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <PricingCard
              tier="Starter"
              price="Free"
              description="Perfect for personal projects and small websites."
              features={[
                "1 chatbot",
                "100 messages per month",
                "Basic customization",
                "Standard response time",
                "Community support",
              ]}
            />
            <PricingCard
              tier="Professional"
              price="$29"
              description="Ideal for growing businesses and content-rich sites."
              features={[
                "5 chatbots",
                "5,000 messages per month",
                "Advanced customization",
                "Faster response time",
                "Priority support",
                "Remove branding",
              ]}
              isPopular={true}
            />
            <PricingCard
              tier="Enterprise"
              price="$99"
              description="For businesses with high-traffic websites and complex needs."
              features={[
                "Unlimited chatbots",
                "50,000 messages per month",
                "Full customization",
                "Fastest response time",
                "Dedicated support",
                "Custom integrations",
                "Analytics dashboard",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 lg:p-12 border border-primary/20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Transform Your Website?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
              Join thousands of businesses using MakeChat.dev to improve
              customer engagement and support.
            </p>
            <Button size="lg" className="font-medium text-base sm:text-lg px-6 sm:px-8">
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span>MakeChat.dev</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Turn any website into an AI-powered chatbot in seconds.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#roadmap"
                    className="hover:text-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} MakeChat.dev. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="sm:w-5 sm:h-5"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="sm:w-5 sm:h-5"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="sm:w-5 sm:h-5"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
