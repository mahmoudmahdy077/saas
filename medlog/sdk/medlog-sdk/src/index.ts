import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface MedLogConfig {
  apiKey?: string
  baseUrl?: string
  accessToken?: string
}

export interface Case {
  id?: string
  resident_id: string
  date: string
  procedure: string
  cpt_code?: string
  icd10_codes?: string[]
  diagnosis?: string
  notes?: string
  attending_physician?: string
  institution_id?: string
  created_at?: string
  updated_at?: string
}

export interface Resident {
  id: string
  user_id?: string
  institution_id: string
  name: string
  email: string
  specialty?: string
  program_year: number
  start_date: string
  created_at?: string
}

export interface Progress {
  resident_id: string
  total_cases: number
  verified_cases: number
  pending_cases: number
  procedures_by_category: Record<string, number>
  case_minimums: Record<string, { required: number; completed: number }>
  milestones: Record<string, number>
}

export interface ReportOptions {
  type: 'case_volume' | 'minimums' | 'resident_summary' | 'milestone'
  resident_id?: string
  start_date?: string
  end_date?: string
  format?: 'json' | 'csv' | 'pdf'
}

export class MedLogClient {
  private client: AxiosInstance

  constructor(config: MedLogConfig) {
    const baseURL = config.baseUrl || 'https://api.medlog.com/v1'
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` })
      }
    })
  }

  async getCases(options?: {
    residentId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<Case[]> {
    const params = new URLSearchParams()
    if (options?.residentId) params.append('resident_id', options.residentId)
    if (options?.startDate) params.append('start_date', options.startDate)
    if (options?.endDate) params.append('end_date', options.endDate)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    const { data } = await this.client.get(`/cases?${params.toString()}`)
    return data.cases
  }

  async createCase(caseData: Case): Promise<Case> {
    const { data } = await this.client.post('/cases', { case: caseData })
    return data.case
  }

  async getCase(caseId: string): Promise<Case> {
    const { data } = await this.client.get(`/cases/${caseId}`)
    return data.case
  }

  async updateCase(caseId: string, caseData: Partial<Case>): Promise<Case> {
    const { data } = await this.client.put(`/cases/${caseId}`, { case: caseData })
    return data.case
  }

  async deleteCase(caseId: string): Promise<void> {
    await this.client.delete(`/cases/${caseId}`)
  }

  async getResidents(): Promise<Resident[]> {
    const { data } = await this.client.get('/residents')
    return data.residents
  }

  async getResident(residentId: string): Promise<Resident> {
    const { data } = await this.client.get(`/residents/${residentId}`)
    return data.resident
  }

  async getProgress(residentId: string): Promise<Progress> {
    const { data } = await this.client.get(`/progress?resident_id=${residentId}`)
    return data.progress
  }

  async generateReport(options: ReportOptions): Promise<any> {
    const { data } = await this.client.post('/reports', { ...options })
    return data
  }

  async exportReport(options: ReportOptions): Promise<Blob> {
    const { data, headers } = await this.client.post(
      '/reports/export',
      { ...options },
      { responseType: 'blob' }
    )
    return data
  }

  async searchCodes(query: string, type: 'cpt' | 'icd10'): Promise<any[]> {
    const { data } = await this.client.get(`/codes?query=${query}&type=${type}`)
    return data.codes
  }
}

export default MedLogClient
