export const COMPLIANCE_TAB_KEYS = [
  'background-checks',
  'fees',
  'documents',
] as const

export type ComplianceTabKey = (typeof COMPLIANCE_TAB_KEYS)[number]

export const DEFAULT_COMPLIANCE_TAB: ComplianceTabKey = 'background-checks'

export const COMPLIANCE_TAB_LABELS: Record<ComplianceTabKey, string> = {
  'background-checks': 'Background Checks',
  fees: 'Background Check Fees',
  documents: 'Document Monitoring',
}

export const LEGACY_COMPLIANCE_PATHS: Record<string, ComplianceTabKey> = {
  '/compliance/background-checks': 'background-checks',
  '/compliance/background-check-fees': 'fees',
  '/compliance/documents': 'documents',
}
