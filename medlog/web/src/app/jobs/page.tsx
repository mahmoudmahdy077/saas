'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin } from 'lucide-react'

const JOBS = [
  { id: 1, title: 'Orthopedic Surgeon', institution: 'Mayo Clinic', location: 'Rochester, MN', type: 'Full-time' },
  { id: 2, title: 'Sports Medicine Fellow', institution: 'HSS', location: 'New York, NY', type: 'Fellowship' },
  { id: 3, title: 'Trauma Surgeon', institution: 'Cedars-Sinai', location: 'Los Angeles, CA', type: 'Full-time' },
]

export default function JobsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-gray-500 mt-1">Orthopedic career opportunities</p>
        </div>

        <SlideUp>
          <div className="space-y-4">
            {JOBS.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <p className="text-gray-500">{job.institution}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4" /> {job.type}
                      </span>
                    </div>
                    <Button>Apply Now</Button>
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
