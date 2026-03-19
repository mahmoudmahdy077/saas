'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star } from 'lucide-react'

const TEMPLATES = [
  { id: 1, name: 'TKA Template Pack', author: 'Dr. Smith', price: 29, rating: 4.8 },
  { id: 2, name: 'Trauma Documentation', author: 'Dr. Johnson', price: 39, rating: 4.9 },
  { id: 3, name: 'Sports Medicine Set', author: 'Dr. Williams', price: 49, rating: 4.7 },
]

export default function MarketplacePage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Template Marketplace</h1>
          <p className="text-gray-500 mt-1">Buy & sell surgical templates</p>
        </div>

        <SlideUp>
          <div className="grid gap-6 md:grid-cols-3">
            {TEMPLATES.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <p className="text-sm text-gray-500">by {template.author}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{template.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${template.price}</span>
                    <Button>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
