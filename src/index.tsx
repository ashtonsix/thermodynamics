import './index.css'
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import ReactSim from './ReactSim'
import {config as defaultConfig} from './shaders2/common'
import main from './shaders2/_referenceImplementation'

main()

const stringifyConfig = (config) => {
  return JSON.stringify(config, null, 2)
}

const parseConfig = (configString) => {
  return JSON.parse(configString)
}

const PI2 = Math.PI * 2
const texturePack = [
  {
    energy: (x, y, size) => Math.random(),
    direction: (x, y, size) => Math.random() * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
]

const App = () => {
  const [playing, setPlaying] = useState(false)
  const [config, setConfig] = useState(defaultConfig)
  const [configText, setConfigText] = useState(stringifyConfig(defaultConfig))
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const config = parseConfig(configText)
      setConfig(config)
      setError(false)
    } catch (e) {
      setError(true)
    }
  }, [configText])

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
          {/* <textarea
            onChange={(e) => setConfigText(e.target.value)}
            onBlur={() => {
              try {
                setConfigText(stringifyConfig(parseConfig(configText)))
              } catch (e) {}
            }}
            value={configText}
            style={{
              marginTop: '20px',
              width: 'calc(100% - 30px)',
              height: '900px',
              outline: 'none',
              border: error ? '10px solid red' : '10px solid transparent',
            }}
          /> */}
        </div>
        <ReactSim config={config} texturePack={texturePack} playing={playing} />
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
