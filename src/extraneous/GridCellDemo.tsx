import React from 'react'
import {configToUniforms, generateTextures} from '../core/common'
import {cycle, Sim} from '../core/shaders/_referenceImplementation'
import useRange from '../util/useRange'

const sigmoid = (x) => {
  x *= 8
  return Math.max(2.0 / (1.0 + Math.pow(2.0, -x)) - 1.0, 0.0)
}

export default function GridCellDemo() {
  const {value: transferRadius, Range: TransferRadiusRange} = useRange(1.304)
  const {value: flo, Range: FloRange} = useRange(0.5)
  const {value: arc, Range: ArcRange} = useRange(0.2)
  const {value: direction, Range: DirectionRange} = useRange(0)
  const config = {
    seed: -1,
    size: Math.floor(transferRadius + 0.5) * 2 + 1,
    transferRadius,
    substances: [{name: 'A', arc, flo}],
    substanceAttractionMatrix: {},
    reactionParameters: {},
    reactions: [],
  }
  const texturePack = (x, y, size) => {
    const center = x === (size - 1) / 2 && y === (size - 1) / 2
    return {
      A: {energy: center ? 1 : 0, direction},
    }
  }

  const sim = new Sim()
  const uniforms = configToUniforms(config)
  const textures = generateTextures(texturePack, config)

  Object.assign(sim.textures, textures)
  sim.size = config.size
  sim.uniforms = uniforms
  cycle(sim, config)

  const cellSize = (100 - 0.125) / config.size

  return (
    <div>
      <svg style={{width: '600px'}} viewBox="0 0 100 100">
        <defs>
          <pattern
            id="grid"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              stroke="white"
              strokeWidth="0.25"
            />
          </pattern>
          <marker
            id="arrowHead"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth={2.5}
            markerHeight={2.5}
            orient="auto-start-reverse"
          >
            <path stroke="white" fill="white" d={`M 0 0 L 10 5 L 0 10 z`} />
          </marker>
        </defs>
        <rect width={100} height={100} fill="url(#grid)" />
        <polyline
          points={new Array(2000)
            .fill(null)
            .map((_, i) => {
              const cxy = (config.size - 1) / 2
              const [x, y] = sim.textures['s01'][cxy][cxy]
              const bisector = Math.atan2(y, x)
              const lo = bisector - config.substances[0].arc * Math.PI
              const hi = bisector + config.substances[0].arc * Math.PI
              const theta = lo + (hi - lo) / (2000 / i)

              const cx = cxy * cellSize + cellSize / 2
              const cy = cxy * cellSize + cellSize / 2
              const r = config.transferRadius * cellSize

              return cx + Math.cos(theta) * r + ',' + (cy + Math.sin(theta) * r)
            })
            .join(' ')}
          fill="none"
          stroke="white"
          strokeWidth={0.5}
        />
        {sim.textures['s01'].map((row, y) =>
          row.map(([xi, yi], x) => {
            const cx = x * cellSize + cellSize / 2
            const cy = y * cellSize + cellSize / 2
            const e = sigmoid((xi ** 2 + yi ** 2) ** 0.5)
            const length = (e * cellSize * 0.75) / 2
            const theta = Math.atan2(yi, xi)
            return (
              <line
                key={x + '.' + y}
                stroke="white"
                x1={cx}
                y1={cy}
                x2={cx + length * Math.cos(theta)}
                y2={cy + length * Math.sin(theta)}
                strokeWidth={length / 4}
                markerEnd="url(#arrowHead)"
              ></line>
            )
          })
        )}
      </svg>
      <br />
      <TransferRadiusRange min={2 ** 0.5 * 0.5} max={3} step={1 / 1000} />
      <br />
      <FloRange min={0} max={1} step={1 / 1000} />
      <br />
      <ArcRange min={0} max={1} step={1 / 1000} />
      <br />
      <DirectionRange min={-Math.PI} max={Math.PI} step={1 / 1000} />
    </div>
  )
}
