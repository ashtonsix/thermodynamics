import './index.css'
import React, {useRef, useEffect, useState} from 'react'

import Simulation from './Sim'
import copyPaste from './shaders/copyPaste.frag'
import displacePrepare from './shaders/displacePrepare.frag'
import displaceRun from './shaders/displaceRun.frag'
import animaSourcePrepare from './shaders/animaSourcePrepare.frag'
import animaSourceRun from './shaders/animaSourceRun.frag'
import useInterval from './useInterval'

const ReactSim = ({initialState, options, playing}) => {
  const ref = useRef(null as any)
  const [sim, setSim] = useState(null as Simulation)

  useEffect(() => {
    const sim = new Simulation(options)
    sim.setData(initialState)
    setSim(sim)

    const container = ref.current
    container.appendChild(sim.canvas)
    sim.display(['primary', 'primary2', 'anima'])

    return () => {
      sim.destroy()
      container.innerHTML = ''
    }
  }, [])

  useEffect(() => {
    if (!sim) return
    sim.canvas.style.width = options.size * options.magnify + 'px'
    sim.canvas.style.height = options.size * options.magnify + 'px'
    Object.assign(sim.options, options)
    sim.display(['primary', 'primary2', 'anima'])
  }, [options])

  useInterval(
    async () => {
      if (!playing || !sim) return
      Object.assign(sim.options, options)
      await sim.compute(copyPaste, ['primary'], ['primary2'])
      await sim.compute(displacePrepare, ['primary'], ['primary'])
      await sim.compute(displaceRun, ['primary', 'anima'], ['primary', 'anima'])
      // prettier-ignore
      await sim.compute(animaSourcePrepare, ['primary', 'anima'], ['primary', 'anima', 'animaSourcePrepared'])
      await sim.reduce('animaSourcePrepared', 'animaSourceTotal')
      // prettier-ignore
      await sim.compute(animaSourceRun, ['primary', 'anima', 'animaSourceTotal'], ['primary', 'anima'])
      await sim.display(['primary', 'primary2', 'anima'])
    },
    playing ? 1000 / options.frameRate : 0
  )

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-block',
        width: options.size * options.magnify,
      }}
    ></div>
  )
}

export default ReactSim
