import { Button, Tag, Timeline } from 'antd'
import { AlertTriangle, Phone, Shield, User } from 'lucide-react'
import type { SafetyCommunication } from '@/types/communication'
import { SAFETY_TYPE_LABELS } from '@/services/communicationApi'
import { priorityColor, priorityLabel } from '@/features/communication/communicationHelpers'

interface SafetyCasePanelProps {
  safety: SafetyCommunication
  onContactDriver?: () => void
  onContactPassenger?: () => void
  onEscalate?: () => void
  onCreateIncident?: () => void
}

export function SafetyCasePanel({
  safety,
  onContactDriver,
  onContactPassenger,
  onEscalate,
  onCreateIncident,
}: SafetyCasePanelProps) {
  const riskLevel =
    safety.priority === 'critical' ? 'Critical' : safety.priority === 'high' ? 'High' : 'Moderate'

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4 text-red-400" />
        <h4 className="text-sm font-semibold text-white">Safety Case</h4>
        <Tag color={priorityColor(safety.priority)} className="ml-auto !m-0">
          {priorityLabel(safety.priority)}
        </Tag>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase text-alygo-text-muted">SOS Trigger</p>
          <p className="text-sm text-white">{SAFETY_TYPE_LABELS[safety.reportType] ?? safety.reportType}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-alygo-text-muted">Incident Type</p>
          <p className="text-sm text-white">{safety.description}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-alygo-text-muted">Risk Level</p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {riskLevel}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-alygo-text-muted">Emergency Contact</p>
          <p className="text-sm text-white">911 Dispatch · Alygo Safety Ops</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] uppercase text-alygo-text-muted">Safety Timeline</p>
        <Timeline
          className="!mt-0"
          items={[
            { children: <span className="text-sm text-white">Report received — {new Date(safety.lastActivity).toLocaleTimeString()}</span> },
            { children: <span className="text-sm text-white">Assigned to {safety.assignedAgent}</span> },
            { children: <span className="text-sm text-white">Live monitoring active on trip {safety.tripId}</span> },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="small" icon={<Phone className="h-3.5 w-3.5" />} onClick={onContactDriver}>
          Contact Driver
        </Button>
        <Button size="small" icon={<User className="h-3.5 w-3.5" />} onClick={onContactPassenger}>
          Contact Passenger
        </Button>
        <Button size="small" danger onClick={onEscalate}>
          Escalate to Safety Team
        </Button>
        <Button size="small" type="primary" onClick={onCreateIncident}>
          Create Incident Report
        </Button>
      </div>
    </div>
  )
}
