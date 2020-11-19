import './index.css'
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import ReactSim from './ReactSim'

const optionPresets = {
  atomic: {
    frameRate: 120,
    size: 200,
    magnify: 4,
    displayMode: 1,
    brightness: -1,
    contrast: 2,
    centripetalFactorX: 1,
    centripetalFactorY: 0,
    transferAngleRegular: Math.PI * (2 / 3),
    transferAngleCentripetal: Math.PI * (1 / 3),
    transferRadius: 5,
    transferFractionRegular: 0.5,
    transferFractionAnima: 0.5,
  },
  complex: {
    frameRate: 120,
    size: 400,
    magnify: 2,
    displayMode: 1,
    brightness: -1,
    contrast: 2,
    centripetalFactorX: 1,
    centripetalFactorY: 1,
    transferAngleRegular: Math.PI * (2 / 3),
    transferAngleCentripetal: Math.PI * (1 / 3),
    transferRadius: 1, // min = 2 ** 0.5 * 0.5
    transferFractionRegular: 0.5,
    transferFractionAnima: 0.5,
  },
  ring: {
    frameRate: 60,
    size: 200,
    magnify: 4,
    displayMode: 1,
    brightness: -1,
    contrast: 2,
    centripetalFactorX: 0.01,
    centripetalFactorY: 0.99,
    transferAngleRegular: 0.01,
    transferAngleCentripetal: 0.01,
    transferRadius: 2,
    transferFractionRegular: 0.5,
    transferFractionAnima: 0.5,
  },
  default: null,
}
optionPresets.default = optionPresets.ring

const wallGenerator = (x, y, size) => {
  // no wall
  // return 0

  // square wall
  // const w = 3
  // return x < w || x > size - w || y < w || y > size - w ? 1 : 0

  // circle wall
  const w = 3
  x -= size / 2
  y -= size / 2
  return (x ** 2 + y ** 2) ** 0.5 > size / 2 - w ? 1 : 0
}

const vectorGenerator = (x, y, size) => {
  // if (x === Math.floor(size * 0.2) && y === Math.floor(size * 0.6)) {
  //   return [1000, 0.1, 1]
  // }
  // x -= size * 0.66
  // y -= size * 0.33
  // const e = (x ** 2 + y ** 2) ** 0.5 > 60 ? 0.0001 : Math.random()
  return [1, Math.random() * Math.PI * 2, 0]
}

const {sin, cos, abs} = Math
const initialStateGenerator = ({size, wallGenerator, vectorGenerator}) => {
  const initialState = {
    primary: new Float32Array(new Array(size * size * 4).fill(0)),
    anima: new Float32Array(new Array(size * size * 4).fill(0)),
  }
  for (let i = 0; i < size * size; i++) {
    const x = Math.floor(i % size)
    const y = Math.floor(i / size)

    const wallState = wallGenerator(x, y, size)
    if (wallState) {
      initialState.primary[i * 4 + 3] = -wallState
      continue
    }

    let [magnitude, theta, animaHue] = vectorGenerator(x, y, size)
    animaHue = animaHue >= 1 && animaHue <= 4 ? Math.floor(animaHue - 1) : null

    if (animaHue != null) {
      initialState.anima[i * 4 + animaHue] = -magnitude
      magnitude = 2
    }

    const ye = (sin(theta) / (abs(sin(theta)) + abs(cos(theta)))) * magnitude
    const xe = (cos(theta) / (abs(sin(theta)) + abs(cos(theta)))) * magnitude
    initialState.primary[i * 4 + 0] = xe
    initialState.primary[i * 4 + 1] = ye
  }
  return initialState
}

const stringifyOptions = (options) => {
  return Object.keys(optionPresets.default)
    .map((k) => `${k} = ${options[k]}`)
    .join('\n')
}

const parseOptions = (optionString) => {
  const options = {}
  optionString.split('\n').forEach((line) => {
    const [key, value] = line.split('=')
    options[key.trim()] = parseFloat(value.trim())
    if (isNaN(options[key.trim()])) throw new Error('invalid value')
  })
  Object.keys(optionPresets.default).forEach((key) => {
    if (options[key] == null) throw new Error('missing value')
  })
  return options
}

const App = () => {
  const [playing, setPlaying] = useState(false)
  const [options, setOptions] = useState(optionPresets.default as any)
  const [optionsText, setOptionsText] = useState(() => {
    return stringifyOptions(optionPresets.default)
  })
  const [error, setError] = useState(false)
  const [initialState] = useState(() => {
    return initialStateGenerator({
      size: options.size,
      wallGenerator,
      vectorGenerator,
    })
  })

  useEffect(() => {
    try {
      const options = parseOptions(optionsText)
      setOptions(options)
      setError(false)
    } catch (e) {
      setError(true)
    }
  }, [optionsText])

  return (
    <div
      style={{
        background: '#111',
        minHeight: '100vh',
        height: '100%',
        color: 'white',
      }}
    >
      <br />
      <div style={{padding: '20px'}}>
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            fontSize: '2rem',
            background: 'none',
            border: 'none',
            outline: 'none',
            verticalAlign: 'top',
          }}
        >
          {playing ? '⏸' : '▶️'}
        </button>
        <div
          style={{
            display: 'inline-block',
            verticalAlign: 'top',
            width: '400px',
            margin: '0 20px',
          }}
        >
          <button
            onClick={() =>
              setOptionsText(stringifyOptions(optionPresets.atomic))
            }
          >
            Atomic
          </button>
          <button
            onClick={() =>
              setOptionsText(stringifyOptions(optionPresets.complex))
            }
            style={{marginLeft: '20px'}}
          >
            Complex
          </button>
          <button
            onClick={() => setOptionsText(stringifyOptions(optionPresets.ring))}
            style={{marginLeft: '20px'}}
          >
            Ring
          </button>
          <textarea
            onChange={(e) => setOptionsText(e.target.value)}
            onBlur={() => {
              try {
                setOptionsText(stringifyOptions(parseOptions(optionsText)))
              } catch (e) {}
            }}
            value={optionsText}
            style={{
              marginTop: '20px',
              width: 'calc(100% - 30px)',
              height: '300px',
              outline: 'none',
              border: error ? '10px solid red' : '10px solid transparent',
            }}
          />
        </div>
        <ReactSim
          initialState={initialState}
          options={options}
          playing={playing}
        />
      </div>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
