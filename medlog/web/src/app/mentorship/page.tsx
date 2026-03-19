'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MessageCircle } from 'lucide-react'

const MENTORS = [
  { id: 1, name: 'Dr. Robert Chen', specialty: 'Trauma', experience: '20 yrs', available: true },
  { id: 2, name: 'Dr. Emily Davis', specialty: 'Sports Medicine', experience: '15 yrs', available: true },
  { id: 3, name: 'Dr. Michael Brown', specialty: 'Arthroplasty', experience: '25 yrs', available: false },
]

export default function MentorshipPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mentorship Program</h1>
          <p className="text-gray-500 mt-1">Connect with experienced surgeons</p>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Find a Mentor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {MENTORS.map((mentor) => (
                  <div key={mentor.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm text-gray-500">{mentor.specialty} • {mentor.experience}</p>
                    </div>
                    <Button variant={mentor.available ? 'default' : 'outline'} disabled={!mentor.available}>
                      {mentor.available ? 'Request' : 'Unavailable'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Your Mentors</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No active mentorships yet</p>
              </CardContent>
            </Card>
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
