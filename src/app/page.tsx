'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Merge, 
  Scissors, 
  Archive, 
  RotateCw, 
  Unlock, 
  PenTool, 
  Signature, 
  Scan,
  Layers,
  FileImage,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Shield,
  Zap,
  Smartphone,
  User,
  Menu,
  X,
  Crown,
  Highlighter,
  Star
} from "lucide-react"
import { useState } from 'react'
import Script from 'next/script'

// Structured Data (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "EasyPDF Tools",
  "alternateName": "EasyPDF",
  "description": "100% Free online PDF tools to merge, split, compress, convert, rotate, unlock, and edit PDF files. No registration required.",
  "url": "https://easypdftools.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "author": {
    "@type": "Organization",
    "name": "EasyPDF Tools Team",
    "url": "https://easypdftools.com"
  },
  "creator": {
    "@type": "Organization", 
    "name": "EasyPDF Tools Team"
  },
  "applicationSubCategory": "PDF Editor",
  "featureList": [
    "Merge PDF files",
    "Split PDF pages", 
    "Compress PDF size",
    "Convert PDF formats",
    "Rotate PDF pages",
    "Unlock password protected PDFs",
    "Add watermark to PDF",
    "E-sign PDF documents",
    "OCR scanned PDFs",
    "Batch process PDFs"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "inLanguage": "en",
  "isAccessibleForFree": true,
  "keywords": "PDF tools, PDF editor, PDF converter, PDF merger, PDF splitter, PDF compressor, online PDF tools, free PDF editor"
}

interface PDFTool {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: {
    light: string
    dark: string
    bgLight: string
    bgDark: string
    hoverLight: string
    hoverDark: string
  }
  isPremium?: boolean
  comingSoon?: boolean
}

const pdfTools: PDFTool[] = [
  {
    id: "merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single document",
    icon: <Merge className="h-8 w-8" />,
    color: {
      light: "text-blue-600",
      dark: "text-blue-400",
      bgLight: "bg-blue-50",
      bgDark: "bg-blue-900/20",
      hoverLight: "bg-blue-100",
      hoverDark: "bg-blue-900/30"
    }
  },
  {
    id: "split",
    title: "Split PDF",
    description: "Divide a PDF into multiple files by page ranges",
    icon: <Scissors className="h-8 w-8" />,
    color: {
      light: "text-purple-600",
      dark: "text-purple-400",
      bgLight: "bg-purple-50",
      bgDark: "bg-purple-900/20",
      hoverLight: "bg-purple-100",
      hoverDark: "bg-purple-900/30"
    }
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: <Archive className="h-8 w-8" />,
    color: {
      light: "text-green-600",
      dark: "text-green-400",
      bgLight: "bg-green-50",
      bgDark: "bg-green-900/20",
      hoverLight: "bg-green-100",
      hoverDark: "bg-green-900/30"
    }
  },
  {
    id: "convert",
    title: "Convert PDF",
    description: "Convert PDFs to and from other formats",
    icon: <FileImage className="h-8 w-8" />,
    color: {
      light: "text-orange-600",
      dark: "text-orange-400",
      bgLight: "bg-orange-50",
      bgDark: "bg-orange-900/20",
      hoverLight: "bg-orange-100",
      hoverDark: "bg-orange-900/30"
    }
  },
  {
    id: "rotate",
    title: "Rotate PDF",
    description: "Rotate pages within a PDF document",
    icon: <RotateCw className="h-8 w-8" />,
    color: {
      light: "text-cyan-600",
      dark: "text-cyan-400",
      bgLight: "bg-cyan-50",
      bgDark: "bg-cyan-900/20",
      hoverLight: "bg-cyan-100",
      hoverDark: "bg-cyan-900/30"
    }
  },
  {
    id: "unlock",
    title: "Unlock PDF",
    description: "Remove password protection from PDFs",
    icon: <Unlock className="h-8 w-8" />,
    color: {
      light: "text-red-600",
      dark: "text-red-400",
      bgLight: "bg-red-50",
      bgDark: "bg-red-900/20",
      hoverLight: "bg-red-100",
      hoverDark: "bg-red-900/30"
    }
  },
  {
    id: "watermark",
    title: "Watermark PDF",
    description: "Add text or image watermarks to PDFs",
    icon: <PenTool className="h-8 w-8" />,
    color: {
      light: "text-indigo-600",
      dark: "text-indigo-400",
      bgLight: "bg-indigo-50",
      bgDark: "bg-indigo-900/20",
      hoverLight: "bg-indigo-100",
      hoverDark: "bg-indigo-900/30"
    }
  },
  {
    id: "annotate",
    title: "Annotate PDF",
    description: "Add comments, highlights, or drawings to PDFs",
    icon: <Highlighter className="h-8 w-8" />,
    color: {
      light: "text-yellow-600",
      dark: "text-yellow-400",
      bgLight: "bg-yellow-50",
      bgDark: "bg-yellow-900/20",
      hoverLight: "bg-yellow-100",
      hoverDark: "bg-yellow-900/30"
    }
  },
  {
    id: "esign",
    title: "E-Sign PDF",
    description: "Add digital signatures to PDFs",
    icon: <Signature className="h-8 w-8" />,
    color: {
      light: "text-emerald-600",
      dark: "text-emerald-400",
      bgLight: "bg-emerald-50",
      bgDark: "bg-emerald-900/20",
      hoverLight: "bg-emerald-100",
      hoverDark: "bg-emerald-900/30"
    },
    isPremium: true
  },
  {
    id: "ocr",
    title: "OCR PDF",
    description: "Convert scanned PDFs into editable text",
    icon: <Scan className="h-8 w-8" />,
    color: {
      light: "text-pink-600",
      dark: "text-pink-400",
      bgLight: "bg-pink-50",
      bgDark: "bg-pink-900/20",
      hoverLight: "bg-pink-100",
      hoverDark: "bg-pink-900/30"
    },
    isPremium: true
  },
  {
    id: "batch",
    title: "Batch Processing",
    description: "Process multiple files simultaneously",
    icon: <Layers className="h-8 w-8" />,
    color: {
      light: "text-teal-600",
      dark: "text-teal-400",
      bgLight: "bg-teal-50",
      bgDark: "bg-teal-900/20",
      hoverLight: "bg-teal-100",
      hoverDark: "bg-teal-900/30"
    },
    isPremium: true
  }
]

export default function Home() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleToolClick = (toolId: string) => {
    // Navigate to the specific tool page
    window.location.href = `/tools/${toolId}`
  }

  const handleAuthClick = () => {
    if (session) {
      signOut()
    } else {
      signIn()
    }
  }

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 0.75s ease-in-out;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out;
        }
        
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.3s ease-in-out;
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
      
      {/* Structured Data (JSON-LD) */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
        {/* Header */}
        <header className="border-b border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <FileText className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200" />
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  EasyPDF Tools
                </h1>
              </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {status === "loading" ? (
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : session ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 group">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        className="h-8 w-8 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all duration-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAuthClick}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => signIn()}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => signIn()}
                    className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? 
                <X className="h-6 w-6 animate-spin-once" /> : 
                <Menu className="h-6 w-6" />
              }
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
              <div className="space-y-3">
                {status === "loading" ? (
                  <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : session ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          className="h-10 w-10 rounded-full ring-2 ring-slate-300 dark:ring-slate-600"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {session.user?.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200"
                      onClick={handleAuthClick}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                      onClick={() => signIn()}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full justify-start bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => signIn()}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/20 animate-gradient-x"></div>
        
        {/* Floating geometric accents */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 dark:from-cyan-800 dark:to-blue-800 rounded-full blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              {/* Enhanced professional badge */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 mb-8 animate-fade-in-up shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse shadow-sm"></div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">100% Free</span>
                <span className="mx-2 text-slate-400">•</span>
                <span>No Registration Required</span>
                <Star className="w-4 h-4 ml-2 text-amber-400 animate-bounce" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight animate-fade-in-up animation-delay-200">
                Professional PDF Tools
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-normal">for Modern Business</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                Streamline your document workflow with our comprehensive suite of PDF tools. 
                <span className="font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent"> Merge, split, compress, convert, and secure</span> your PDFs with enterprise-grade reliability.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-4 w-full sm:w-auto bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={() => {
                    alert('Upload PDF functionality coming soon! This would open the file upload dialog.')
                  }}
                >
                  <Upload className="mr-3 h-5 w-5 group-hover:translate-y-[-2px] transition-transform duration-200" />
                  <span className="font-medium">Upload PDF</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-4 w-full sm:w-auto border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                  onClick={() => {
                    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">Explore Tools</span>
                  <ArrowDown className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400 animate-fade-in-up animation-delay-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Cross-platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools-section" className="py-12 md:py-20 px-4 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-6">
              Comprehensive PDF Toolkit
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Professional-grade tools designed for efficiency and reliability in document management.
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {pdfTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="group cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-sm"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-xl ${tool.color.bgLight} dark:${tool.color.bgDark} ${tool.color.light} dark:${tool.color.dark} group-hover:${tool.color.hoverLight} dark:group-hover:${tool.color.hoverDark} transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl`}>
                        {tool.icon}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-200">
                        {tool.title}
                      </CardTitle>
                      {tool.isPremium && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 text-amber-800 dark:text-amber-300 border-amber-200/50 shadow-sm">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {tool.comingSoon && (
                        <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                    <Button 
                      variant="ghost" 
                      className={`w-full mt-4 font-medium transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md ${
                        tool.isPremium 
                          ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-900/30 dark:hover:to-amber-800/30 hover:text-amber-800 dark:hover:text-amber-200' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{tool.comingSoon ? "Notify Me" : "Use Tool"}</span>
                      <ArrowUp className="ml-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/50 px-4 relative overflow-hidden">
        {/* Subtle sophisticated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-slate-400 to-gray-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
              Why Choose <span className="text-slate-700 dark:text-slate-300">EasyPDF Tools</span>?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12 md:mb-16 max-w-2xl mx-auto">
              Experience the perfect blend of power, simplicity, and security in PDF management
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                  <Shield className="h-10 w-10 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  100% Secure & Private
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your files are encrypted and automatically deleted after processing. No registration required.
                </p>
              </article>
              <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                  <Zap className="h-10 w-10 text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  Lightning Fast Processing
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Process PDFs in seconds with our optimized algorithms. No waiting, instant results.
                </p>
              </article>
              <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                  <Smartphone className="h-10 w-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  Works on All Devices
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compatible with Windows, Mac, Linux, iOS, and Android. Access from anywhere, anytime.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Sophisticated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(100,116,139,0.1),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Start Using <span className="text-slate-700 dark:text-slate-300">EasyPDF Tools</span> Today
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Join millions of users who trust EasyPDF Tools for their document management needs. 
              <span className="font-semibold text-slate-800 dark:text-slate-200">No credit card required.</span>
            </p>
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              ⚡ Instant access • 🔒 Secure & private • 📱 Works on all devices
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-6 md:py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">EasyPDF Tools</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
              <p>© 2025 EasyPDF Tools is Powered by SWARM Technologies All rights reserved.</p>
              <p className="mt-1">Built for professional document management</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}