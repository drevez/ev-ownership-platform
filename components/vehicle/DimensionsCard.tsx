import { formatDimension, formatLiters } from '@/logic/formatters'

interface DimensionsData {
  cargoLitersSeatsUp?: number
  cargoLitersSeatsDown?: number
  frunkLiters?: number
  rearLegroomMM?: number
  wheelbaseMM?: number
  lengthMM?: number
  widthMM?: number
  heightMM?: number
  [key: string]: any
}

interface DimensionsCardProps {
  dimensions?: DimensionsData
}

interface DimensionItemProps {
  label: string
  value: number | undefined
  format: (val: number | undefined) => string
  icon: string
}

function DimensionItem({ label, value, format, icon }: DimensionItemProps) {
  if (value === undefined) return null

  return (
    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">
        {format(value)}
      </p>
    </div>
  )
}

export function DimensionsCard({ dimensions = {} }: DimensionsCardProps) {
  const hasData = Object.values(dimensions).some(v => v !== undefined)

  if (!hasData) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Dimensions & Storage</h2>

      {/* Exterior Dimensions */}
      {(dimensions.lengthMM || dimensions.widthMM || dimensions.heightMM || dimensions.wheelbaseMM) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📏</span> Exterior Dimensions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DimensionItem
              label="Length"
              value={dimensions.lengthMM}
              format={(v) => formatDimension(v, true)}
              icon="→"
            />
            <DimensionItem
              label="Width"
              value={dimensions.widthMM}
              format={(v) => formatDimension(v, true)}
              icon="↔️"
            />
            <DimensionItem
              label="Height"
              value={dimensions.heightMM}
              format={(v) => formatDimension(v, true)}
              icon="↑"
            />
            <DimensionItem
              label="Wheelbase"
              value={dimensions.wheelbaseMM}
              format={(v) => formatDimension(v, true)}
              icon="🛞"
            />
          </div>
        </div>
      )}

      {/* Interior Space */}
      {(dimensions.cargoLitersSeatsUp || dimensions.cargoLitersSeatsDown || dimensions.frunkLiters) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📦</span> Storage & Space
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DimensionItem
              label="Trunk (Seats Up)"
              value={dimensions.cargoLitersSeatsUp}
              format={formatLiters}
              icon="🚗"
            />
            <DimensionItem
              label="Trunk (Seats Down)"
              value={dimensions.cargoLitersSeatsDown}
              format={formatLiters}
              icon="📦"
            />
            <DimensionItem
              label="Frunk"
              value={dimensions.frunkLiters}
              format={formatLiters}
              icon="🔓"
            />
          </div>
        </div>
      )}

      {/* Legroom */}
      {dimensions.rearLegroomMM && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💺</span> Comfort
          </h3>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-slate-900 mb-2">Rear Legroom</p>
            <p className="text-3xl font-bold text-green-900">
              {formatDimension(dimensions.rearLegroomMM, true)}
            </p>
            <p className="text-xs text-slate-600 mt-2">Space for rear passengers</p>
          </div>
        </div>
      )}

      {/* Quick Summary */}
      {dimensions.lengthMM && dimensions.widthMM && dimensions.cargoLitersSeatsUp && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-3">📐 Vehicle Summary</p>
            <div className="space-y-2 text-slate-700">
              <p>
                Overall size: <span className="font-bold">{formatDimension(dimensions.lengthMM, true)} long</span> ×{' '}
                <span className="font-bold">{formatDimension(dimensions.widthMM, true)} wide</span>
              </p>
              <p>
                Cargo space: <span className="font-bold">{formatLiters(dimensions.cargoLitersSeatsUp)}</span> with rear seats up
                {dimensions.cargoLitersSeatsDown && (
                  <>, <span className="font-bold">{formatLiters(dimensions.cargoLitersSeatsDown)}</span> with seats down</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
