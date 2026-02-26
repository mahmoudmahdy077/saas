'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Sparkles, Building2, Users, Star } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  max_residents: number
  max_cases_per_month: number
  max_ai_analyses: number
  ai_enabled: boolean
  custom_branding: boolean
  api_access: boolean
  priority_support: boolean
  sso_enabled: boolean
  features: any
}

const featureList = [
  { key: 'ai_enabled', label: 'AI Case Analysis', basic: true, pro: true, enterprise: true },
  { key: 'max_ai_analyses', label: 'AI Analyses per Month', basic: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
  { key: 'max_residents', label: 'Max Residents', basic: '10', pro: '50', enterprise: 'Unlimited' },
  { key: 'max_cases_per_month', label: 'Cases per Month', basic: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
  { key: 'custom_branding', label: 'Custom Branding', basic: false, pro: true, enterprise: true },
  { key: 'api_access', label: 'API Access', basic: false, pro: true, enterprise: true },
  { key: 'priority_support', label: 'Priority Support', basic: false, pro: true, enterprise: true },
  { key: 'sso_enabled', label: 'SSO / SAML', basic: false, pro: false, enterprise: true },
]

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    fetch('/api/subscription/plans')
      .then(res => res.json())
      .then(data => {
        if (data.plans) setPlans(data.plans)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getPrice = (plan: Plan) => {
    if (plan.name === 'enterprise') return 'Custom'
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  }

  const getPriceLabel = (plan: Plan) => {
    if (plan.name === 'enterprise') return 'Contact Sales'
    return billingCycle === 'monthly' ? '/month' : '/year'
  }

  const getFeatureValue = (plan: Plan, feature: typeof featureList[0]) => {
    const value = (plan as any)[feature.key]
    if (feature.key === 'max_ai_analyses') {
      return value === -1 ? 'Unlimited' : value
    }
    if (feature.key === 'max_residents') {
      return value === -1 ? 'Unlimited' : value
    }
    if (feature.key === 'max_cases_per_month') {
      return value === -1 ? 'Unlimited' : value
    }
    return value ? '✓' : '✗'
  }

  const getFeatureDisplay = (plan: Plan, feature: typeof featureList[0]) => {
    const val = getFeatureValue(plan, feature)
    if (val === '✓') return <Check className="w-5 h-5 text-green-500" />
    if (val === '✗') return <X className="w-5 h-5 text-gray-300" />
    return <span className="text-sm font-medium">{val}</span>
  }

  const handleSubscribe = (planName: string) => {
    if (planName === 'free') {
      router.push('/register')
    } else if (planName === 'enterprise') {
      window.location.href = 'mailto:sales@medlog.app?subject=Enterprise%20Plan%20Inquiry'
    } else {
      router.push(`/settings?tab=billing&plan=${planName}`)
    }
  }

  const currentPlan = plans.find(p => p.name === 'free')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your residency program. All plans include core features.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-slate-100 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border ${
                  plan.name === 'pro'
                    ? 'border-slate-900 shadow-xl'
                    : 'border-slate-200 shadow-sm'
                } overflow-hidden`}
              >
                {plan.name === 'pro' && (
                  <div className="absolute top-0 left-0 right-0 bg-slate-900 text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className={`p-6 ${plan.name === 'pro' ? 'pt-10' : ''}`}>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {plan.display_name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 min-h-[40px]">
                    {plan.description || (plan.name === 'free' ? 'For individual residents' : plan.name === 'basic' ? 'For small programs' : plan.name === 'pro' ? 'For growing programs' : 'For large institutions')}
                  </p>

                  <div className="mt-6">
                    <span className="text-4xl font-bold text-slate-900">
                      {getPrice(plan) === 'Custom' ? 'Custom' : `$${getPrice(plan)}`}
                    </span>
                    <span className="text-slate-500 ml-1">
                      {getPriceLabel(plan)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all ${
                      plan.name === 'pro'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : plan.name === 'enterprise'
                        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.name === 'free' ? 'Get Started' : plan.name === 'enterprise' ? 'Contact Sales' : 'Subscribe'}
                  </button>
                </div>

                <div className="border-t border-slate-100 p-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Includes:</h4>
                  <ul className="space-y-3">
                    {featureList.map((feature) => (
                      <li key={feature.key} className="flex items-center gap-3">
                        {getFeatureDisplay(plan, feature)}
                        <span className="text-sm text-slate-600">{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-slate-600">
            Need a custom solution?{' '}
            <a href="mailto:sales@medlog.app" className="text-slate-900 font-medium hover:underline">
              Contact us
            </a>
          </p>
        </div>

        <div className="mt-12 bg-slate-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 text-sm">
                We accept all major credit cards. Enterprise customers can pay via invoice.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600 text-sm">
                Our Free plan has no time limit. Try it as long as you need!
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-slate-600 text-sm">
                Your data remains accessible for 30 days after cancellation. You can export it anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
