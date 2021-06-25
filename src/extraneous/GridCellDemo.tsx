import React from 'react'
import {configToUniforms, generateTextures} from '../core/common'
import {cycle, Sim} from '../core/shaders/_referenceImplementation'
import useRange from '../util/useRange'

const sigmoid = (x) => {
  x *= 8
  return Math.max(2.0 / (1.0 + Math.pow(2.0, -x)) - 1.0, 0.0)
}

const SquareGrid = ({size, children}) => {
  const unitSize = (100 - 0.125) / size

  return (
    <svg style={{width: '600px'}} viewBox="0 0 100 100">
      <defs>
        <pattern
          id="grid"
          width={unitSize}
          height={unitSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${unitSize} 0 L 0 0 0 ${unitSize}`}
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
      {children.map(({xi, yi, f}) => {
        const cx = xi * unitSize + unitSize / 2
        const cy = yi * unitSize + unitSize / 2
        return f({cx, cy, unitSize})
      })}
    </svg>
  )
}

const HexagonGrid = ({size, children}) => {
  const s = size
  const w = 21.7 * s + 7.6
  const h = 25 * s + 12.5
  const sw = 0.25
  const unitSize = 25

  const polygon = [
    [22.0, 24.8],
    [29.2, 37.3],
    [43.7, 37.3],
    [50.9, 24.8],
    [43.7, 12.3],
    [29.2, 12.3],
  ]
  return (
    <svg style={{width: '600px', margin: 5}} viewBox={`0 0 ${w} ${h + sw / 2}`}>
      <defs>
        <pattern
          id="hexagons"
          width="43.4"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points={polygon.map(([x, y]) => `${x},${y + sw}`).join(' ')}
            id="hex"
            fill="none"
            stroke="white"
            strokeWidth={sw}
          />
          <use xlinkHref="#hex" y="25" />
          <use xlinkHref="#hex" y="-25" />
          <use xlinkHref="#hex" y="12.5" x="-21.8" />
          <use xlinkHref="#hex" y="-12.5" x="-21.8" />
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
      <mask id="hexagonMask">
        <rect x="0" y="0" width={w} height={h + sw / 2} fill="white" />
        <polygon
          points={polygon
            .map(([x, y]) => `${x - 25},${y + sw + 25 * (s - 0.5)}`)
            .join(' ')}
          id="hex"
          fill="black"
          stroke="white"
          strokeWidth={sw}
        />
        <polygon
          points={polygon
            .map(([x, y]) => {
              x = x - 25 + (s - 0.5) * 21.7
              if (s % 2) {
                return `${x},${y + sw + 25 * (s - 0.5)}`
              } else {
                return `${x},${y + sw - 25}`
              }
            })
            .join(' ')}
          id="hex"
          fill="black"
          stroke="white"
          strokeWidth={sw}
        />
      </mask>
      <rect
        width={w}
        height={h + sw / 2}
        fill="url(#hexagons)"
        mask="url(#hexagonMask)"
      />
      {children.map(({xi, yi, f}) => {
        const cx = xi * 21.7 + 21.7 / 2 + 3.8
        const cy = yi * unitSize + unitSize / 2 + (xi % 2 ? 12.5 : 0)
        return f({cx, cy, unitSize})
      })}
    </svg>
  )
}

const Grid = ({shape, size, children}) => {
  const Grid = shape === 'hexagon' ? HexagonGrid : SquareGrid
  return <Grid size={size}>{children}</Grid>
}

export default function GridCellDemo() {
  const {value: transferRadius, Range: TransferRadiusRange} = useRange(1.3)
  const {value: flo, Range: FloRange} = useRange(0.7)
  const {value: arc, Range: ArcRange} = useRange(0.3333)
  const {value: direction, Range: DirectionRange} = useRange(0.4)
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
  const maxLength = config.size ** 2

  return (
    <div style={{padding: 10}}>
      <Grid shape="square" size={config.size}>
        {[].concat(
          ...sim.textures['s01']
            .map((row, yi) =>
              row.map(([x, y], xi) => {
                return {
                  xi,
                  yi,
                  f({cx, cy, unitSize}) {
                    const e =
                      ((x ** 2 + y ** 2) ** 0.5 / maxLength) ** 0.4 * 1.5
                    const length = (e * unitSize * 0.75) / 2
                    const theta = Math.atan2(y, x)
                    return (
                      <line
                        key={cx + '.' + cy}
                        stroke="white"
                        x1={cx}
                        y1={cy}
                        x2={cx + length * Math.cos(theta)}
                        y2={cy + length * Math.sin(theta)}
                        strokeWidth={length / 4}
                        markerEnd="url(#arrowHead)"
                      />
                    )
                  },
                }
              })
            )
            .concat({
              xi: (config.size - 1) / 2,
              yi: (config.size - 1) / 2,
              f({cx, cy, unitSize}) {
                return (
                  <polyline
                    key="arc"
                    points={new Array(2000)
                      .fill(null)
                      .map((_, i) => {
                        const xyi = (config.size - 1) / 2
                        const [x, y] = sim.textures['s01'][xyi][xyi]
                        const bisector = Math.atan2(y, x)
                        const lo = bisector - config.substances[0].arc * Math.PI
                        const hi = bisector + config.substances[0].arc * Math.PI
                        const theta = lo + (hi - lo) / (2000 / i)

                        const r = config.transferRadius * unitSize

                        // prettier-ignore
                        return (cx + Math.cos(theta) * r) + ',' + (cy + Math.sin(theta) * r)
                      })
                      .join(' ')}
                    fill="none"
                    stroke="white"
                    strokeWidth={0.5}
                  />
                )
              },
            })
        )}
      </Grid>
      {/* 
        { => {
            const cx = x * cellSize + cellSize / 2
            const cy = y * cellSize + cellSize / 2

            )
          })
        )}
      </svg> */}
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

export function HexgonCellDemo() {
  const s = 4
  const w = 21.7 * s + 7.6
  const h = 25 * s + 12.5
  const sw = 0.25

  const polygon = [
    [22.0, 24.8],
    [29.2, 37.3],
    [43.7, 37.3],
    [50.9, 24.8],
    [43.7, 12.3],
    [29.2, 12.3],
  ]
  return (
    <div>
      <svg
        style={{width: '600px', margin: 5}}
        viewBox={`0 0 ${w} ${h + sw / 2}`}
      >
        <defs>
          <pattern
            id="hexagons"
            width="43.4"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points={polygon.map(([x, y]) => `${x},${y + sw}`).join(' ')}
              id="hex"
              fill="none"
              stroke="white"
              strokeWidth={sw}
            />
            <use xlinkHref="#hex" y="25" />
            <use xlinkHref="#hex" y="-25" />
            <use xlinkHref="#hex" y="12.5" x="-21.8" />
            <use xlinkHref="#hex" y="-12.5" x="-21.8" />
          </pattern>
        </defs>
        <mask id="myMask">
          <rect x="0" y="0" width={w} height={h + sw / 2} fill="white" />
          <polygon
            points={polygon
              .map(([x, y]) => `${x - 25},${y + sw + 25 * (s - 0.5)}`)
              .join(' ')}
            id="hex"
            fill="black"
            stroke="white"
            strokeWidth={sw}
          />
          <polygon
            points={polygon
              .map(([x, y]) => {
                x = x - 25 + (s - 0.5) * 21.7
                if (s % 2) {
                  return `${x},${y + sw + 25 * (s - 0.5)}`
                } else {
                  return `${x},${y + sw - 25}`
                }
              })
              .join(' ')}
            id="hex"
            fill="black"
            stroke="white"
            strokeWidth={sw}
          />
        </mask>
        <rect
          width={w}
          height={h + sw / 2}
          fill="url(#hexagons)"
          mask="url(#myMask)"
        />
      </svg>
    </div>
  )
}
