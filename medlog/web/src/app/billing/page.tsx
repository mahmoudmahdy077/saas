'use client'

import { useState } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: 0, features: ['50 cases/month', 'Basic analytics', 'Mobile access'], popular: false },
  { name: 'Pro', price: 29, features: ['Unlimited cases', 'Advanced analytics', 'Export PDF/CSV', 'Priority support'], popular: true },
  { name: 'Institution', price: 999, features: ['Everything in Pro', 'Multi-user', 'Admin dashboard', 'SSO', 'Custom integrations'], popular: false },
]

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('Free')

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-gray-500 mt-1">Choose the plan that fits your practice</p>
        </div>

        <SlideUp>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} disabled={currentPlan === plan.name}>
                    {currentPlan === plan.name ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">No payment method</p>
                  <p className="text-sm text-gray-500">Add a card to upgrade to Pro</p>
                </div>
                <Button variant="outline">Add Card</Button>
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
