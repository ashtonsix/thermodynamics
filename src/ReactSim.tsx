import './index.css'
import React, {useRef, useEffect, useState} from 'react'

import Simulation from './Sim'
import displacePrepare from './shaders/displacePrepare.frag'
import displaceRun from './shaders/displaceRun.frag'
import useInterval from './useInterval'

const ReactSim = ({
  size,
  magnification,
  initialState,
  centripetalFactor,
  centripetalAngle,
  transferRadius,
  transferFractionRegular,
  transferFractionAnima,
  frameRate,
  playing,
}) => {
  const ref = useRef(null as any)
  const [sim, setSim] = useState(null)

  useEffect(() => {
    const sim = new Simulation({size, magnification})
    sim.setData(initialState[0], initialState[1])
    setSim(sim)

    const container = ref.current
    container.appendChild(sim.canvas)
    sim.display()

    return () => {
      container.innerHTML = ''
    }
  }, [])

  useInterval(
    () => {
      if (!playing || !sim) return
      Object.assign(sim.options, {
        centripetalFactor,
        centripetalAngle,
        transferRadius,
        transferFractionRegular,
        transferFractionAnima,
      })
      sim.fragCompute(displacePrepare)
      sim.fragCompute(displaceRun)
      sim.display()
    },
    playing ? 1000 / frameRate : 0
  )

  useEffect(() => {
    if (!sim) return
    sim.options.centripetalFactor = centripetalFactor
    sim.options.centripetalAngle = centripetalAngle
  }, [sim, centripetalFactor, centripetalAngle])

  return (
    <div
      ref={ref}
      style={{
        width: size * magnification,
        margin: '0 auto',
      }}
    ></div>
  )
}

export default ReactSim
