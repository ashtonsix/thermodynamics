import React, {useRef, useEffect, useState} from 'react'

import Sim from './Sim'
import useInterval from '../util/useInterval'

const ReactSim = ({config, texturePack, display, playing}) => {
  const ref = useRef(null as any)
  const [sim, setSim] = useState(null as Sim)

  useEffect(() => {
    const sim = new Sim(config, texturePack)
    setSim(sim)

    const container = ref.current
    sim.canvas.style.width = config.size * display.magnify + 'px'
    sim.canvas.style.height = config.size * display.magnify + 'px'
    container.appendChild(sim.shaderBridge.canvas)
    sim.display()

    return () => {
      sim.destroy()
      container.innerHTML = ''
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!sim) return
    sim.canvas.style.width = config.size * display.magnify + 'px'
    sim.canvas.style.height = config.size * display.magnify + 'px'
    Object.assign(sim.config, config)
    sim.display()
  }, [config]) // eslint-disable-line

  useInterval(
    async () => {
      if (!playing || !sim) return
      // const u = (Math.sin(performance.now() / 1000) + 1) / 2
      // sim.config.substances[0].arc = 0.5 + u * 0.3

      await sim.cycle()
    },
    playing ? 1000 / display.frameRate : 0
  )

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-block',
        width: config.size * display.magnify,
      }}
    ></div>
  )
}

export default ReactSim
