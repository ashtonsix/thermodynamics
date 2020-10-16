import './index.css'
import React, {useRef, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'

import Simulation from './Sim'
import displaceShader from './shaders/02-displace.frag'
import blurShader from './shaders/03-blur.frag'
import createCoordsToPixelatedCircleMapper from './mapCoordsToPixelatedCircle'

createCoordsToPixelatedCircleMapper([
  [0, 3],
  [1, 3],
  [2, 2],
])

const height = 200
const width = 200

const App = () => {
  const ref = useRef(null as any)
  const [x, setX] = useState(1)
  const [y, setY] = useState(1)

  useEffect(() => {
    const initialData = new Array(height * width * 4).fill(0).map((_, i) => {
      const x = Math.random() * 1.6 - 0.8
      const y = Math.random() * 1.6 - 0.8
      const z = 0
      const w = 1
      return [x, y, z, w][i % 4]
    })
    initialData[660] = x
    initialData[661] = y
    const initialDataTyped = new Float32Array(initialData)
    const sim = new Simulation({height, width})
    const container = ref.current
    container.appendChild(sim.canvas)
    sim.setData(initialDataTyped)
    ;(async () => {
      while (true) {
        await sim.fragCompute(blurShader)
        await sim.fragCompute(displaceShader)
        await sim.display()
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
    })()
    return () => {
      container.innerHTML = ''
    }
  }, [x, y])

  return (
    <div>
      <input
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
      <br />
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
