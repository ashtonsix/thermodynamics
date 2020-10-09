import './index.css'
import React, {useRef, useEffect} from 'react'
import ReactDOM from 'react-dom'

import Simulation from './Sim'
import displaceShader from './shaders/02-displace.frag'
import blurShader from './shaders/03-blur.frag'

const App = () => {
  const ref = useRef(null as any)

  useEffect(() => {
    const initialData = new Array(400 * 400 * 4).fill(0).map((_, i) => {
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      // const x = 0
      // const y = 0
      const z = 0
      const w = 1
      return [x, y, z, w][i % 4]
    })
    // initialData[4880] = 2
    // initialData[4976] = -100
    // initialData[4881] = -0.6
    const initialDataTyped = new Float32Array(initialData)
    const sim = new Simulation()
    ref.current.appendChild(sim.canvas)
    sim.setData(initialDataTyped)
    ;(async () => {
      while (true) {
        await sim.fragCompute(displaceShader)
        await sim.fragCompute(blurShader)
        await sim.display()
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
    })()
  }, [])

  return <div ref={ref}></div>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
