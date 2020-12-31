import React, {useEffect, useState} from 'react'
import ReactSim from './core/ReactBridge'
import {config as defaultConfig, texturePack} from './defaultConfig'
import DisplaySettings from './DisplaySettings'

const stringifyConfig = (config) => {
  return JSON.stringify(config, null, 2)
}

const parseConfig = (configString) => {
  return JSON.parse(configString)
}

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
        display: 'grid',
        gridTemplateAreas: "'header header header' 'left middle right'",
        gridTemplateColumns: '400px 1fr 400px',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <div style={{gridArea: 'header', padding: '20px'}}>
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
      </div>
      <div
        style={{
          gridArea: 'left',
        }}
      >
        <textarea
          onChange={(e) => setConfigText(e.target.value)}
          onBlur={() => {
            try {
              setConfigText(stringifyConfig(parseConfig(configText)))
            } catch (e) {}
          }}
          value={configText}
          style={{
            width: '100%',
            height: '800px',
            outline: 'none',
            border: error ? '10px solid red' : '10px solid transparent',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{gridArea: 'middle', margin: '0 20px'}}>
        <ReactSim config={config} texturePack={texturePack} playing={playing} />
      </div>
      <div style={{gridArea: 'right'}}>
        <DisplaySettings
          onChange={(display) => {
            setConfigText(stringifyConfig({...config, display}))
          }}
        />
      </div>
    </div>
  )
}

export default App
