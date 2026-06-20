export const COMPLIANCE_TAB_KEYS = [
  'overview',
  'background-checks',
  'fees',
  'documents',
  'restrictions',
] as const

export type ComplianceTabKey = (typeof COMPLIANCE_TAB_KEYS)[number]

export const DEFAULT_COMPLIANCE_TAB: ComplianceTabKey = 'overview'

export const COMPLIANCE_TAB_LABELS: Record<ComplianceTabKey, string> = {
  overview: 'Overview',
  'background-checks': 'Background Checks',
  fees: 'Background Check Fees',
  documents: 'Document Monitoring',
  restrictions: 'Driver Restrictions',
}

export const LEGACY_COMPLIANCE_PATHS: Record<string, ComplianceTabKey> = {
  '/compliance/background-checks': 'background-checks',
  '/compliance/background-check-fees': 'fees',
  '/compliance/documents': 'documents',
  '/compliance/restrictions': 'restrictions',
}
