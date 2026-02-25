export const specialties = [
  { id: 'general-surgery', name: 'General Surgery' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'internal-medicine', name: 'Internal Medicine' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'obstetrics-gynecology', name: 'Obstetrics & Gynecology' },
  { id: 'psychiatry', name: 'Psychiatry' },
  { id: 'radiology', name: 'Radiology' },
  { id: 'anesthesiology', name: 'Anesthesiology' },
  { id: 'emergency-medicine', name: 'Emergency Medicine' },
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'other', name: 'Other' },
]

export const caseCategories = {
  'general-surgery': {
    name: 'General Surgery',
    procedures: [
      'Appendectomy',
      'Cholecystectomy',
      'Hernia Repair',
      'Bowel Resection',
      'Mastectomy',
      'Thyroidectomy',
      'Splenectomy',
      'Adrenalectomy',
      'Gastrectomy',
      'Pancreatectomy',
    ],
  },
  'orthopedics': {
    name: 'Orthopedics',
    procedures: [
      'Knee Arthroscopy',
      'Hip Replacement',
      'Knee Replacement',
      'ACL Reconstruction',
      'Rotator Cuff Repair',
      'Spinal Fusion',
      'Fracture Fixation',
      'Carpal Tunnel Release',
      'Meniscus Repair',
      'Shoulder Replacement',
    ],
  },
  'internal-medicine': {
    name: 'Internal Medicine',
    procedures: [
      'Colonoscopy',
      'EGD',
      'Bronchoscopy',
      'Lumbar Puncture',
      'Paracentesis',
      'Thoracentesis',
      'Central Line',
      'Arterial Line',
      'Endotracheal Intubation',
      'Cardioversion',
    ],
  },
}

export const roles = [
  { value: 'primary', label: 'Primary Operator' },
  { value: 'assistant', label: 'First Assistant' },
  { value: 'observer', label: 'Observer' },
]

export const verificationStatuses = [
  { value: 'self', label: 'Self-attested', color: 'gray' },
  { value: 'consultant_verified', label: 'Consultant Verified', color: 'blue' },
  { value: 'pd_approved', label: 'PD Approved', color: 'green' },
]

export const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

export const complications = [
  'None',
  'Bleeding',
  'Infection',
  'Wound Dehiscence',
  'Anastomotic Leak',
  'Nerve Injury',
  'Vascular Injury',
  'Organ Injury',
  'Death',
  'Other',
]
