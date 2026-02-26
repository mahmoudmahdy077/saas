import Link from 'next/link'
import {
  Stethoscope,
  Brain,
  TrendingUp,
  Users,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-300 via-background to-background blur-3xl" />
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-primary-900">MedLog</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="py-24 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-primary-900 mb-6 text-balance">
              Your Surgical & Medical Case Logbook,{' '}
              <span className="text-primary-600">Smartly Powered</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track cases, get AI-powered insights, and build your professional portfolio.
              Designed for residents, verified by consultants.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-[0_0_40px_-10px_rgba(77,102,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(77,102,235,0.7)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="text-gray-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/80 hover:shadow-sm backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-gray-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From case logging to career-building tools
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(77,102,235,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Case Logging
                </h3>
                <p className="text-gray-600">
                  Log unlimited cases with customizable templates. Track procedures,
                  complications, and outcomes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(255,214,107,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-600">
                  Get intelligent summaries, gap analysis, and personalized
                  recommendations for your training.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(77,102,235,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Visual dashboards showing your case volume, specialty coverage,
                  and competency progression.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(255,214,107,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Verification System
                </h3>
                <p className="text-gray-600">
                  Get your cases verified by consultants and program directors
                  to build credibility for your CV.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(77,102,235,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  CV-Ready Exports
                </h3>
                <p className="text-gray-600">
                  Export your verified cases as professional CVs and share
                  portfolios with potential employers.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(255,214,107,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Institutional Access
                </h3>
                <p className="text-gray-600">
                  Program directors can track resident progress, generate
                  reports, and manage specialty programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0f2c] to-[#0D0D12]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full point-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6 text-white text-balance">
              Ready to Transform Your Training?
            </h2>
            <p className="text-gray-300 mb-10 text-xl font-light">
              Join thousands of residents tracking their cases the smart way.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">
                Simple Pricing
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-4xl font-bold text-gray-900 mb-4">$0</p>
                <p className="text-gray-500 mb-6">For personal use</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Unlimited cases</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Basic AI summary</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">CSV export</span>
                  </li>
                </ul>
              </div>

              {/* Pro */}
              <div className="p-8 rounded-3xl border-2 border-primary bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(77,102,235,0.15)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(77,102,235,0.25)] transition-all duration-300 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-4xl font-bold text-gray-900 mb-4">$9.99<span className="text-lg text-gray-500 font-medium">/mo</span></p>
                <p className="text-gray-500 mb-6">For serious residents</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">AI gap analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">CV generator</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Shareable links</span>
                  </li>
                </ul>
              </div>

              {/* Program */}
              <div className="p-8 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Program</h3>
                <p className="text-4xl font-bold text-gray-900 mb-4">$49<span className="text-lg text-gray-500 font-medium">/mo</span></p>
                <p className="text-gray-500 mb-6">For residency programs</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Up to 10 residents</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">PD dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Monthly reports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Custom templates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-primary-900">MedLog</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2026 MedLog. Built for medical education.
          </p>
        </div>
      </footer>
    </div>
  )
}
