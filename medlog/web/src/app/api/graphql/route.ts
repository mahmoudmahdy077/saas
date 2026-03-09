import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

function sanitizeString(input: any): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>'"]/g, '').substring(0, 1000)
}

function sanitizeLimit(limit: any, defaultVal: number = 50): number {
  const num = parseInt(limit) || defaultVal
  return Math.min(Math.max(1, num), 100)
}

function sanitizeOffset(offset: any): number {
  const num = parseInt(offset) || 0
  return Math.max(0, num)
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  return user
}

interface GraphQLContext {
  userId: string
  institutionId: string
  role: string
}

const typeDefs = `
  type Query {
    cases(limit: Int, offset: Int, category: String): [Case!]!
    case(id: ID!): Case
    residents: [Resident!]!
    resident(id: ID!): Resident
    me: User!
    stats: Stats!
    milestones: [Milestone!]!
    milestoneAssessments(residentId: ID!): [MilestoneAssessment!]!
  }

  type Mutation {
    createCase(input: CaseInput!): Case!
    updateCase(id: ID!, input: CaseInput!): Case!
    deleteCase(id: ID!): Boolean!
    submitMilestoneAssessment(residentId: ID!, milestoneId: ID!, level: Int!, notes: String): MilestoneAssessment!
  }

  type Case {
    id: ID!
    title: String!
    date: String!
    category: String!
    diagnosis: String
    description: String
    role: String
    verificationStatus: String
    createdAt: String!
  }

  type Resident {
    id: ID!
    fullName: String!
    email: String
    specialty: String
    caseCount: Int!
    verifiedCount: Int!
  }

  type User {
    id: ID!
    email: String!
    fullName: String!
    role: String!
    institutionId: ID
  }

  type Stats {
    totalCases: Int!
    totalResidents: Int!
    verifiedCases: Int!
    pendingVerifications: Int!
  }

  type Milestone {
    id: ID!
    number: Int!
    competencyArea: String!
    descriptions: MilestoneDescriptions!
  }

  type MilestoneDescriptions {
    level1: String
    level2: String
    level3: String
    level4: String
    level5: String
  }

  type MilestoneAssessment {
    id: ID!
    residentId: ID!
    milestoneId: ID!
    level: Int!
    assessorName: String
    assessmentDate: String!
    notes: String
  }

  input CaseInput {
    title: String!
    date: String
    category: String!
    diagnosis: String
    description: String
    role: String
    procedureType: String
  }
`

const resolvers = {
  Query: {
    cases: async (_: any, args: { limit?: number; offset?: number; category?: string }, context: GraphQLContext) => {
      let query = 'SELECT * FROM public.cases WHERE institution_id = $1'
      const params: any[] = [context.institutionId]

      if (args.category) {
        query += ` AND category = $${params.length + 1}`
        params.push(args.category)
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(args.limit || 50, args.offset || 0)

      const result = await pool.query(query, params)
      return result.rows.map(c => ({
        id: c.id,
        title: c.title,
        date: c.date,
        category: c.category,
        diagnosis: c.diagnosis,
        description: c.description,
        role: c.role,
        verificationStatus: c.verification_status,
        createdAt: c.created_at
      }))
    },

    case: async (_: any, args: { id: string }, context: GraphQLContext) => {
      const result = await pool.query('SELECT * FROM public.cases WHERE id = $1 AND institution_id = $2', [args.id, context.institutionId])
      if (result.rows.length === 0) return null
      const c = result.rows[0]
      return {
        id: c.id,
        title: c.title,
        date: c.date,
        category: c.category,
        diagnosis: c.diagnosis,
        description: c.description,
        role: c.role,
        verificationStatus: c.verification_status,
        createdAt: c.created_at
      }
    },

    residents: async (_: any, __: any, context: GraphQLContext) => {
      const result = await pool.query(`
        SELECT p.*, 
          (SELECT COUNT(*) FROM public.cases WHERE resident_id = p.id) as case_count,
          (SELECT COUNT(*) FROM public.cases WHERE resident_id = p.id AND verified_at IS NOT NULL) as verified_count
        FROM public.profiles p
        WHERE p.institution_id = $1 AND p.role = 'resident'
      `, [context.institutionId])

      return result.rows.map(r => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        specialty: r.specialty_id,
        caseCount: parseInt(r.case_count) || 0,
        verifiedCount: parseInt(r.verified_count) || 0
      }))
    },

    me: async (_: any, __: any, context: GraphQLContext) => {
      const result = await pool.query('SELECT * FROM public.profiles WHERE id = $1', [context.userId])
      if (result.rows.length === 0) return null
      const p = result.rows[0]
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        role: p.role,
        institutionId: p.institution_id
      }
    },

    stats: async (_: any, __: any, context: GraphQLContext) => {
      const casesResult = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN verified_at IS NOT NULL THEN 1 END) as verified,
          COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending
        FROM public.cases WHERE institution_id = $1
      `, [context.institutionId])

      const residentsResult = await pool.query(`
        SELECT COUNT(*) as total FROM public.profiles 
        WHERE institution_id = $1 AND role = 'resident'
      `, [context.institutionId])

      const stats = casesResult.rows[0]
      return {
        totalCases: parseInt(stats.total) || 0,
        verifiedCases: parseInt(stats.verified) || 0,
        pendingVerifications: parseInt(stats.pending) || 0,
        totalResidents: parseInt(residentsResult.rows[0].total) || 0
      }
    },

    milestones: async () => {
      const result = await pool.query('SELECT * FROM public.milestone_definitions ORDER BY milestone_number')
      return result.rows.map(m => ({
        id: m.id,
        number: m.milestone_number,
        competencyArea: m.competency_area,
        descriptions: {
          level1: m.level1_description,
          level2: m.level2_description,
          level3: m.level3_description,
          level4: m.level4_description,
          level5: m.level5_description
        }
      }))
    },

    milestoneAssessments: async (_: any, args: { residentId: string }, context: GraphQLContext) => {
      const result = await pool.query(`
        SELECT ma.*, p.full_name as assessor_name
        FROM public.milestone_assessments ma
        LEFT JOIN public.profiles p ON ma.assessor_id = p.id
        WHERE ma.resident_id = $1
        ORDER BY ma.assessment_date DESC
      `, [args.residentId])

      return result.rows.map(m => ({
        id: m.id,
        residentId: m.resident_id,
        milestoneId: m.milestone_id,
        level: m.level,
        assessorName: m.assessor_name,
        assessmentDate: m.assessment_date,
        notes: m.notes
      }))
    }
  },

  Mutation: {
    createCase: async (_: any, args: { input: any }, context: GraphQLContext) => {
      const result = await pool.query(`
        INSERT INTO public.cases (resident_id, institution_id, title, date, category, diagnosis, description, role, procedure_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        context.userId,
        context.institutionId,
        args.input.title,
        args.input.date || new Date(),
        args.input.category,
        args.input.diagnosis,
        args.input.description,
        args.input.role,
        args.input.procedureType
      ])
      const c = result.rows[0]
      return {
        id: c.id,
        title: c.title,
        date: c.date,
        category: c.category,
        diagnosis: c.diagnosis,
        description: c.description,
        role: c.role,
        verificationStatus: c.verification_status,
        createdAt: c.created_at
      }
    },

    deleteCase: async (_: any, args: { id: string }, context: GraphQLContext) => {
      await pool.query('DELETE FROM public.cases WHERE id = $1 AND institution_id = $2', [args.id, context.institutionId])
      return true
    },

    submitMilestoneAssessment: async (_: any, args: { residentId: string; milestoneId: string; level: number; notes?: string }, context: GraphQLContext) => {
      const result = await pool.query(`
        INSERT INTO public.milestone_assessments (resident_id, milestone_id, assessor_id, level, assessment_date, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
        RETURNING *
      `, [args.residentId, args.milestoneId, context.userId, args.level, args.notes])

      const m = result.rows[0]
      return {
        id: m.id,
        residentId: m.resident_id,
        milestoneId: m.milestone_id,
        level: m.level,
        assessorName: context.userId,
        assessmentDate: m.assessment_date,
        notes: m.notes
      }
    }
  }
}

function parseQuery(query: string): any {
  const queryLower = query.toLowerCase()

  if (queryLower.includes('mutation')) {
    const createMatch = query.match(/createCase\s*\(\s*input:\s*(\w+)\s*\{([^}]+)\}/)
    if (createMatch) {
      const inputFields: Record<string, string> = {}
      const fieldMatches = Array.from(createMatch[2].matchAll(/(\w+):\s*\$(\w+)/g))
      for (const match of fieldMatches) {
        inputFields[match[1]] = match[2]
      }
      return { type: 'mutation', operation: 'createCase', inputFields }
    }
  }

  if (queryLower.includes('cases')) {
    return { type: 'query', operation: 'cases' }
  }

  if (queryLower.includes('residents')) {
    return { type: 'query', operation: 'residents' }
  }

  if (queryLower.includes('stats')) {
    return { type: 'query', operation: 'stats' }
  }

  if (queryLower.includes('milestones')) {
    return { type: 'query', operation: 'milestones' }
  }

  return null
}

function extractVariables(body: string): Record<string, any> {
  const variables: Record<string, any> = {}

  const jsonMatch = body.match(/\"variables\"\s*:\s*(\{[^}]+\})/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].replace(/(\w+):/g, '"$1":'))
      Object.assign(variables, parsed)
    } catch (e) { }
  }

  return variables
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (!rateLimit(`graphql:${ip}`)) {
    return NextResponse.json({ errors: [{ message: 'Rate limit exceeded' }] }, { status: 429 })
  }

  try {
    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    const context: GraphQLContext = {
      userId: user.id,
      institutionId: profile?.institution_id || '',
      role: profile?.role || 'resident'
    }

    const body = await request.json()
    const { query, variables = {} } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ errors: [{ message: 'Invalid query' }] }, { status: 400 })
    }

    if (query.length > 5000) {
      return NextResponse.json({ errors: [{ message: 'Query too long' }] }, { status: 400 })
    }

    const parsed = parseQuery(query)

    if (!parsed) {
      return NextResponse.json({ errors: [{ message: 'Invalid or unsupported query' }] }, { status: 400 })
    }

    const sanitizedVariables = { ...variables }

    if (sanitizedVariables.limit) {
      sanitizedVariables.limit = sanitizeLimit(sanitizedVariables.limit)
    }
    if (sanitizedVariables.offset) {
      sanitizedVariables.offset = sanitizeOffset(sanitizedVariables.offset)
    }
    if (sanitizedVariables.category) {
      sanitizedVariables.category = sanitizeString(sanitizedVariables.category)
    }
    if (sanitizedVariables.input?.category) {
      sanitizedVariables.input.category = sanitizeString(sanitizedVariables.input.category)
    }
    if (sanitizedVariables.input?.diagnosis) {
      sanitizedVariables.input.diagnosis = sanitizeString(sanitizedVariables.input.diagnosis)
    }
    if (sanitizedVariables.input?.description) {
      sanitizedVariables.input.description = sanitizeString(sanitizedVariables.input.description)
    }

    let result: any = null

    if (parsed?.type === 'query') {
      const resolver = resolvers.Query[parsed.operation as keyof typeof resolvers.Query]
      if (resolver) {
        result = await resolver(null, sanitizedVariables, context)
      }
    } else if (parsed?.type === 'mutation') {
      const resolver = resolvers.Mutation[parsed.operation as keyof typeof resolvers.Mutation]
      if (resolver) {
        result = await resolver(null, sanitizedVariables, context)
      }
    }

    return NextResponse.json({ data: result ? { [parsed?.operation || 'result']: result } : {} })
  } catch (error: any) {
    console.error('GraphQL Error:', error)
    return NextResponse.json({ errors: [{ message: 'Internal server error' }] }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    schema: typeDefs,
    endpoint: '/api/graphql'
  })
}
