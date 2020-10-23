import './index.css'
import React, {useRef, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'

import Simulation from './Sim'
import displaceShader from './shaders/02-displace.frag'
import wallShader from './shaders/04-wall.frag'
import createCoordsToPixelatedCircleMapper from './mapCoordsToPixelatedCircle'

createCoordsToPixelatedCircleMapper([
  [0, 3],
  [1, 3],
  [2, 2],
])

const height = 300
const width = 300

const isWall = (i) => {
  // no wall
  // return false

  // square wall
  // const x = Math.floor((i % (width * 4)) / 4)
  // const y = Math.floor(i / width / 4)
  // return x < 5 || x > width - 5 || y < 5 || y > width - 5

  // circle wall
  const x = Math.floor((i % (width * 4)) / 4) - width / 2
  const y = Math.floor(i / width / 4) - height / 2
  return (x ** 2 + y ** 2) ** 0.5 > width / 2 - 10
}

const App = () => {
  const ref = useRef(null as any)
  const [xe, setXe] = useState(10000)
  const [ye, setYe] = useState(0)

  useEffect(() => {
    const initialData1 = new Float32Array(
      new Array(height * width * 4).fill(0).map((_, i) => {
        const wall = isWall(i)
        const x = wall ? 0 : Math.random() * 2 - 1
        const y = wall ? 0 : Math.random() * 2 - 1
        const z = 0
        const w = wall ? 1 : 0
        return [x, y, z, w][i % 4]
      })
    )
    const initialData2 = new Float32Array(
      new Array(height * width * 4).fill(0).map((_, i) => {
        const x = 0
        const y = 0
        const z = 0
        const w = 0
        return [x, y, z, w][i % 4]
      })
    )
    // const y = 150
    // const x = 150
    // const i = y * width + x
    // initialData[i * 4 + 0] = xe
    // initialData[i * 4 + 1] = ye

    let running = true
    const sim = new Simulation({height, width})
    const container = ref.current
    container.appendChild(sim.canvas)
    sim.setData(initialData1, initialData2)
    ;(async () => {
      while (running) {
        await sim.fragCompute(wallShader)
        await sim.fragCompute(displaceShader)
        await sim.display()
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
    })()
    return () => {
      container.innerHTML = ''
      running = false
    }
  }, [xe, ye])

  return (
    <div>
      {/* <input
        type="range"
        onChange={(e) => setX(+e.target.value)}
        value={x}
        min={-2}
        max={2}
        step={0.1}
        style={{width: '400px'}}
      />
      <input
        type="range"
        onChange={(e) => setY(+e.target.value)}
        value={y}
        min={-2}
        max={2}
        step={0.1}
        style={{width: '400px'}}
      />
      <br />
      {x}, {y}
      <br />
      <br /> */}
      <div ref={ref}></div>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
    {/* <code style={{padding: 10, display: 'block'}}>
      <pre>{test()}</pre>
    </code> */}
  </React.StrictMode>,
  document.getElementById('root')
)
