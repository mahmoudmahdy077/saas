'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, BookOpen, Award } from 'lucide-react'

const COURSES = [
  { id: 1, title: 'Trauma Fundamentals', lessons: 12, duration: '4h', cme: 4, progress: 75 },
  { id: 2, title: 'Arthroscopy Techniques', lessons: 8, duration: '3h', cme: 3, progress: 30 },
  { id: 3, title: 'Sports Medicine Advanced', lessons: 15, duration: '6h', cme: 6, progress: 0 },
]

export default function CoursesPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Platform</h1>
          <p className="text-gray-500 mt-1">CME courses & certifications</p>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Total CME</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">45</div><p className="text-sm text-gray-500">Credits earned</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Courses</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">12</div><p className="text-sm text-gray-500">Available</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Play className="w-5 h-5" /> In Progress</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">3</div><p className="text-sm text-gray-500">Active courses</p></CardContent>
            </Card>
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <div className="grid gap-6 md:grid-cols-3">
            {COURSES.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.lessons} lessons • {course.duration} • {course.cme} CME</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    {course.progress > 0 ? 'Continue' : 'Start Course'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
