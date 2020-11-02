import './index.css'
import React, {useRef, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'

import Simulation from './Sim'
import displaceShader2 from './shaders/03-displace.frag'
import wallShader from './shaders/04-wall.frag'
import test from './test'

const height = 400
const width = 400
const magnification = 2

const isWall = (i) => {
  // no wall
  // return false

  // square wall
  // const x = Math.floor((i % (width * 4)) / 4)
  // const y = Math.floor(i / width / 4)
  // return x < 1 || x > width - 1 || y < 1 || y > width - 1

  // circle wall
  const x = Math.floor((i % (width * 4)) / 4) - width / 2
  const y = Math.floor(i / width / 4) - height / 2
  return (x ** 2 + y ** 2) ** 0.5 > width / 2 - 2
}

const App = () => {
  const ref = useRef(null as any)
  const [xe, setXe] = useState(10000)
  const [ye, setYe] = useState(0)
  const [centripetalFactor, setCentripetalFactor] = useState(1)
  const [centripetalAngle, setCentripetalAngle] = useState(Math.PI * (1 / 3))
  const [sim, setSim] = useState(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const initialData1 = new Float32Array(
      new Array(height * width * 4).fill(0).map((_, i) => {
        const wall = isWall(i)
        const x = Math.random() * 2 - 1
        const y = Math.random() * 2 - 1
        const z = 0
        const w = wall ? -1 : 0
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
    const y = height / 2
    const x = height / 2
    const i = y * width + x
    initialData1[i * 4 + 0] = 0 // xe
    initialData1[i * 4 + 1] = 0 // ye

    const sim = new Simulation({
      height,
      width,
      centripetalFactor,
      centripetalAngle,
      magnification,
    })
    const container = ref.current
    container.appendChild(sim.canvas)
    sim.setData(initialData1, initialData2)
    setSim(sim)
    ;(async () => {
      await sim.display()
    })()
    return () => {
      container.innerHTML = ''
    }
  }, [xe, ye])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      while (playing && mounted) {
        await sim.fragCompute(wallShader)
        await sim.display()
        await sim.fragCompute(displaceShader2)
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
    })()
    return () => {
      mounted = false
    }
  }, [playing, sim])

  useEffect(() => {
    if (!sim) return
    sim.options.centripetalFactor = centripetalFactor
    sim.options.centripetalAngle = centripetalAngle

    if (sim.options.centripetalFactor >= 1) {
      // radius = 1.0
      sim.options.smallArc = Math.PI * (1 / 3)
    } else {
      // radius = 1.306562964877
      sim.options.smallArc = Math.PI * (1 / 4)
    }
  }, [sim, centripetalFactor, centripetalAngle])

  return (
    <div style={{background: '#111', minHeight: '100vh'}}>
      {/* <pre>{test()}</pre> */}
      <br />
      <button
        onClick={() => setPlaying(!playing)}
        style={{
          fontSize: '2rem',
          background: 'none',
          border: 'none',
          outline: 'none',
        }}
      >
        {playing ? '⏸' : '▶️'}
      </button>
      <br />
      <input
        type="range"
        onChange={(e) => setCentripetalFactor(+e.target.value)}
        value={centripetalFactor}
        min={0}
        max={3}
        step={0.001}
        style={{width: '400px'}}
      />
      <br />
      <input
        type="range"
        onChange={(e) => setCentripetalAngle(+e.target.value)}
        value={centripetalAngle}
        min={Math.PI * (1 / 4)}
        max={Math.PI * (1 / 2)}
        step={0.001}
        style={{width: '400px'}}
      />
      <div
        ref={ref}
        style={{
          width: width * magnification,
          margin: '0 auto',
        }}
      ></div>
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
