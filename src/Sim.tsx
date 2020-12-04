import ShaderBridge from './ShaderBridge'
import cycle from './shaders2/cycle.frag'
import display from './shaders2/display.frag'
import {
  configToUniforms,
  generateTextures,
  substanceReactParse,
} from './shaders2/common'

const doInserts = (str, inserts) => {
  str = str.replace(
    /\/\*\s*insert:(\w+)(?:.|\n)*?\*\//gm,
    (match, key) => inserts[key] || match
  )
  str = str.replace(
    /\/\*\s*insert-start:(\w+)(?:.|\n)*?insert-end(?:.|\n)*?\*\//gm,
    (match, key) => inserts[key] || match
  )
  return str
}

const copyPaste = doInserts(cycle, {main: 'copyPaste()'})
const compactLength = doInserts(cycle, {main: 'compactLength()'})
const transferPrepare = doInserts(cycle, {main: 'transferPrepare()'})
const transferRun = doInserts(cycle, {main: 'transferRun()'})
const addressPrepare = doInserts(cycle, {main: 'addressPrepare()'})
const addressRun = doInserts(cycle, {main: 'addressRun()'})

function substanceReactGenerator(config) {
  const parsed = substanceReactParse(config)

  if (parsed.length === 0) {
    return doInserts(cycle, {main: 'substanceReact()', reactionCount: 0})
  }

  const reactions = parsed
    .map(({uniforms}) => {
      return (
        'Reaction(' +
        uniforms
          .map((u) => `vec4(${u.map((v) => v.toFixed(1)).join(', ')})`)
          .join(', ') +
        ')'
      )
    })
    .join(', ')

  const reactionWeights = parsed.map(({weight}) => weight).join(', ')

  return doInserts(cycle, {
    main: 'substanceReact()',
    reactions,
    reactionWeights,
    reactionCount: reactions.length,
  })
}

export default class Sim {
  config = null
  shaderBridge: ShaderBridge = null
  canvas: HTMLCanvasElement = null
  async cycle() {
    const sim = this.shaderBridge
    sim.uniforms = configToUniforms(this.config)
    await sim.compute(copyPaste, ['s01'], ['s01Prev'])
    await sim.compute(copyPaste, ['s23'], ['s23Prev'])
    await sim.compute(copyPaste, ['s45'], ['s45Prev'])
    await sim.compute(copyPaste, ['s67'], ['s67Prev'])
    await sim.compute(compactLength, ['s01', 's23'], ['s0123Len'])
    await sim.compute(compactLength, ['s45', 's67'], ['s4567Len'])
    // prettier-ignore
    await sim.compute(
      transferPrepare,
      ['s01', 's23', 's0123Len', 's45', 's67', 's4567Len'],
      [
        's01FWTFS', 's23FWTFS', 's01Given', 's23Given', 'avgArcAndFlo',
        's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
      ]
    );
    // prettier-ignore
    await sim.compute(
      transferRun,
      [
        's01', 's23', 's01FWTFS', 's23FWTFS', 's01Given', 's23Given', 'avgArcAndFlo',
        's45', 's67', 's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
      ],
      ['s01', 's23', 's45', 's67']
    );
    // const substanceReact = substanceReactGenerator(this.config)
    // await sim.compute(
    //   substanceReact,
    //   ['s01', 's23', 'a0123', 'a4567', 's45', 's67'],
    //   ['s01', 's23', 'a0123', 'a4567', 's45', 's67']
    // )
    // await sim.compute(addressPrepare, ['a0123', 'a4567'], ['ap0123', 'ap4567'])
    // await sim.reduce('ap0123', 'at0123')
    // await sim.reduce('ap4567', 'at4567')
    // await sim.compute(
    //   addressRun,
    //   ['a0123', 'a4567', 'at0123', 'at4567'],
    //   ['a0123', 'a4567']
    // )
    // prettier-ignore
    await sim.display(display, [
      's01', 's23', 's01Prev', 's23Prev', 's01Given', 's23Given', 'a0123', 'a4567', 's45',
      's67', 's45Prev', 's67Prev', 's45Given', 's67Given',
    ])
  }
  async display() {
    const sim = this.shaderBridge
    sim.uniforms = configToUniforms(this.config)
    // prettier-ignore
    await sim.display(display, [
      's01', 's23', 's01Prev', 's23Prev', 's01Given', 's23Given', 'a0123', 'a4567', 's45',
      's67', 's45Prev', 's67Prev', 's45Given', 's67Given',
    ])
  }
  destroy() {
    this.shaderBridge.destroy()
  }
  constructor(config, texturePack) {
    const textures = generateTextures(texturePack, config.size)
    this.config = config
    this.shaderBridge = new ShaderBridge(config.size)
    this.shaderBridge.setData(textures)
    this.canvas = this.shaderBridge.canvas
  }
}
