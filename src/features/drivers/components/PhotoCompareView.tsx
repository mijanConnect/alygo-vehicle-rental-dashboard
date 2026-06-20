import { Image } from 'antd'
import { Camera, User } from 'lucide-react'

interface PhotoCompareViewProps {
  profilePhoto: string
  liveSelfiePhoto?: string
  driverName: string
}

export function PhotoCompareView({ profilePhoto, liveSelfiePhoto, driverName }: PhotoCompareViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
          <User className="h-4 w-4 text-indigo-400" />
          Profile Photo
        </div>
        <Image
          src={profilePhoto}
          alt={`${driverName} profile`}
          className="!w-full !rounded-lg !object-cover"
          style={{ maxHeight: 280 }}
          preview={{ mask: 'Zoom' }}
        />
        <p className="mt-2 text-xs text-alygo-text-muted">Collected during onboarding</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
          <Camera className="h-4 w-4 text-indigo-400" />
          Latest Live Selfie
        </div>
        {liveSelfiePhoto ? (
          <>
            <Image
              src={liveSelfiePhoto}
              alt={`${driverName} live selfie`}
              className="!w-full !rounded-lg !object-cover"
              style={{ maxHeight: 280 }}
              preview={{ mask: 'Zoom' }}
            />
            <p className="mt-2 text-xs text-alygo-text-muted">
              Real-time camera capture only — gallery uploads disabled
            </p>
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-alygo-text-muted">
            Awaiting live selfie capture from driver app
          </div>
        )}
      </div>
    </div>
  )
}
