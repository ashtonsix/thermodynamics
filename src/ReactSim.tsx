import './index.css'
import React, {useRef, useEffect, useState} from 'react'

import Sim from './Sim'
import useInterval from './useInterval'

const frameRate = 10
const magnify = 4

const ReactSim = ({config, texturePack, playing}) => {
  const ref = useRef(null as any)
  const [sim, setSim] = useState(null as Sim)

  useEffect(() => {
    const sim = new Sim(config, texturePack)
    setSim(sim)

    const container = ref.current
    sim.canvas.style.width = config.size * magnify + 'px'
    sim.canvas.style.height = config.size * magnify + 'px'
    container.appendChild(sim.shaderBridge.canvas)
    sim.display().then(() => sim.cycle())

    return () => {
      sim.destroy()
      container.innerHTML = ''
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!sim) return
    sim.canvas.style.width = config.size * magnify + 'px'
    sim.canvas.style.height = config.size * magnify + 'px'
    Object.assign(sim.config, config)
    sim.display()
  }, [config]) // eslint-disable-line

  useInterval(
    async () => {
      if (!playing || !sim) return
      await sim.cycle()
    },
    playing ? 1000 / frameRate : 0
  )

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-block',
        width: config.size * magnify,
      }}
    ></div>
  )
}

export default ReactSim
