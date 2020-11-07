import './index.css'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import ReactSim from './ReactSim'

const size = 200
const magnification = 5
const frameRate = 300
const transferFractionRegular = 0
const transferFractionAnima = 0.5

const isWall = (x, y, size) => {
  // no wall
  return false

  // square wall
  // const w = 2
  // return x < w || x > size - w || y < w || y > size - w

  // circle wall
  const w = 2
  x -= size / 2
  y -= size / 2
  return (x ** 2 + y ** 2) ** 0.5 > size / 2 - w
}

const initialStateGenerator = ({size, wallGenerator, vectorGenerator}) => {
  const initialState1 = new Float32Array(
    new Array(size * size * 4).fill(0).map((_, i) => {
      const x = Math.floor((i % (size * 4)) / 4)
      const y = Math.floor(i / size / 4)

      const isWall = wallGenerator(x, y, size)
      if (isWall) return [0, 0, 0, -1][i % 4]

      const [magnitude, theta] = vectorGenerator(x, y, size)
      const ye = Math.sin(theta) * magnitude
      const xe = Math.cos(theta) * magnitude
      return [xe, ye, 0, 0][i % 4]
    })
  )
  const initialState2 = new Float32Array(
    new Array(size * size * 4).fill(0).map((_, i) => {
      const x = Math.floor((i % (size * 4)) / 4)
      const y = Math.floor(i / size / 4)
      if (x === Math.floor(size / 2) && y === Math.floor(size / 2)) {
        return [20000, 0, 0, 0][i % 4]
      } else {
        return [0, 0, 0, 0][i % 4]
      }
    })
  )
  return [initialState1, initialState2]
}

const App = () => {
  const [playing, setPlaying] = useState(false)
  const [centripetalFactor, setCentripetalFactor] = useState(0)
  const [transferRadius, setTransferRadius] = useState(1)
  const [centripetalAngle, setCentripetalAngle] = useState(Math.PI * (1 / 3))
  const [initialState] = useState(() => {
    return initialStateGenerator({
      size,
      wallGenerator: isWall,
      vectorGenerator: (x, y, size) => {
        // if (x === Math.floor(size / 2) && y === Math.floor(size / 2)) {
        //   return [100, 0]
        // } else {
        //   return [0, 0]
        // }
        return [Math.random(), Math.random() * Math.PI * 2]
      },
    })
  })

  return (
    <div style={{background: '#111', minHeight: '100vh', color: 'white'}}>
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
      <input
        type="range"
        onChange={(e) => setTransferRadius(+e.target.value)}
        value={transferRadius}
        min={1}
        max={5}
        step={0.01}
        style={{width: '400px'}}
      />
      <ReactSim
        size={size}
        initialState={initialState}
        magnification={magnification}
        centripetalFactor={centripetalFactor}
        centripetalAngle={centripetalAngle}
        transferRadius={transferRadius}
        transferFractionRegular={transferFractionRegular}
        transferFractionAnima={transferFractionAnima}
        frameRate={frameRate}
        playing={playing}
      />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
