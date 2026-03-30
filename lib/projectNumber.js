export function generateProjectNumber(year, sequence) {
  const y = year || new Date().getFullYear()
  const seq = String(sequence).padStart(3, '0')
  return `SB-${y}-${seq}`
}

export const PROJECT_TYPES = {
  'Basement Renovation': 'BSM', 'Kitchen Remodel': 'KIT',
  'Bathroom Remodel': 'BTH', 'Home Addition': 'ADD',
  'Whole-Home Renovation': 'REN', 'Custom Home Build': 'CHB',
  'Spec Build': 'SPB', 'Other': 'OTH',
}

export function getTypeCode(projectType) {
  return PROJECT_TYPES[projectType] || 'OTH'
}
