import { Progress, Tag } from 'antd'
import { CheckCircle2, Server, Wifi } from 'lucide-react'

const services = [
  { name: 'API Gateway', status: 'operational', uptime: 99.98 },
  { name: 'Trip Engine', status: 'operational', uptime: 99.95 },
  { name: 'Payment (Stripe)', status: 'operational', uptime: 99.99 },
  { name: 'Socket.IO', status: 'degraded', uptime: 98.2 },
  { name: 'Maps Service', status: 'operational', uptime: 99.91 },
]

export function PlatformHealthMonitor() {
  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Platform Health Monitor</h3>
        <Tag color="green" icon={<CheckCircle2 className="mr-1 inline h-3 w-3" />}>
          All Systems Operational
        </Tag>
      </div>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-white">{service.name}</span>
              </div>
              <span className="text-xs text-alygo-text-muted">{service.uptime}% uptime</span>
            </div>
            <Progress
              percent={service.uptime}
              size="small"
              strokeColor={service.status === 'operational' ? '#10b981' : '#f59e0b'}
              showInfo={false}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
        <Wifi className="h-4 w-4" />
        Real-time monitoring active via Socket.IO
      </div>
    </div>
  )
}
