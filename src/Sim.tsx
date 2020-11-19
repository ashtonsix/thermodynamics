import {PicoGL} from 'picogl/build/module/picogl'
import quadShader from './shaders/quad.vert'
import displayShader from './shaders/display.frag'
import reduce1Shader from './shaders/reduce1.frag'
import reduce2Shader from './shaders/reduce2.frag'

const defaultOptions = {
  centripetalFactorX: 1,
  centripetalFactorY: 0,
  transferAngleRegular: Math.PI * (2 / 3),
  transferAngleCentripetal: Math.PI * (1 / 3),
  transferRadius: 1,
  transferFractionRegular: 0.5,
  transferFractionAnima: 0.5,
  displayMode: 1,
  size: 100,
  magnify: 8,
}

export default class Simulation {
  destroyed = false
  options = null
  canvas = null
  pico = null
  programs = {}
  quads = {full: null, reduce1: null, reduce2: null}
  textures = {read: {}, write: {}}
  async compute(fragShader, texturesIn, texturesOut) {
    this.draw(fragShader, texturesIn, texturesOut, 'full')
  }
  async display(texturesIn) {
    this.draw(displayShader, texturesIn, 'screen', 'full')
  }
  async reduce(textureIn: string, textureOut: string) {
    this.draw(reduce1Shader, [textureIn], ['reduce1'], 'reduce1')
    this.draw(reduce2Shader, ['reduce1'], [textureOut], 'reduce2')
  }
  async draw(fragShader, texturesIn, texturesOut, quadName) {
    const {pico, programs} = this
    const quad = this.quads[quadName]

    let program
    if (programs[fragShader]) {
      program = programs[fragShader]
    } else {
      program = await pico.createProgram(quadShader, fragShader)
      programs[fragShader] = program
    }

    const drawCall = pico.createDrawCall(program, quad)
    for (const i in texturesIn) {
      drawCall.texture(
        'texture' + (+i + 1),
        this.getTexture(texturesIn[i], 'read', 'full')
      )
    }
    drawCall.uniformBlock('SceneUniforms', this.getUniformBuffer())

    if (texturesOut === 'screen') {
      pico.defaultDrawFramebuffer().clear()
      drawCall.draw()
    } else {
      const frameBuffer = pico.createFramebuffer()
      for (const i in texturesOut) {
        frameBuffer.colorTarget(
          +i,
          this.getTexture(texturesOut[i], 'write', quadName)
        )
      }
      pico.drawFramebuffer(frameBuffer).clear()
      drawCall.draw()
      frameBuffer.delete()
      for (const i in texturesOut) {
        this.rotateTexture(texturesOut[i])
      }
    }

    return drawCall
  }
  setData(textures) {
    for (const k in textures) {
      this.getTexture(k, 'read', 'full').data(textures[k])
      this.getTexture(k, 'write', 'full').data(textures[k])
    }
  }
  getUniformBuffer() {
    const {options, pico} = this
    if (options.transferRadius - 0.5 === Math.floor(options.transferRadius)) {
      options.transferRadius -= 0.000001
    }
    const a = [
      options.size,
      options.centripetalFactorX,
      options.centripetalFactorY,
      options.transferAngleRegular,
      options.transferAngleCentripetal,
      options.transferRadius,
      options.transferFractionRegular,
      options.transferFractionAnima,
      options.displayMode,
      options.brightness,
      options.contrast,
    ]
    const uniformBuffer = pico.createUniformBuffer(
      new Array(a.length).fill(PicoGL.FLOAT)
    )
    for (const i in a) uniformBuffer.set(i, a[i])
    uniformBuffer.update()
    return uniformBuffer
  }
  getQuad(xmin, xmax, ymin, ymax) {
    const {pico} = this

    // prettier-ignore
    const quadGeom = new Float32Array([
      xmin,ymin, xmin,ymax, xmax,ymax,
      xmin,ymin, xmax,ymin, xmax,ymax,
    ])
    const quadVertexBuffer = pico.createVertexBuffer(PicoGL.FLOAT, 2, quadGeom)
    const quadVertexArray = pico
      .createVertexArray()
      .vertexAttributeBuffer(0, quadVertexBuffer)

    return quadVertexArray
  }
  getTexture(
    name,
    io: 'read' | 'write',
    quadName: 'full' | 'reduce1' | 'reduce2'
  ) {
    const {pico, textures, options} = this
    const [width, height] = {
      full: [options.size, options.size],
      reduce1: [1, options.size],
      reduce2: [1, 1],
    }[quadName]

    if (textures[io][name]) return textures[io][name]

    const params = {internalFormat: PicoGL.RGBA32F}
    textures.read[name] = pico.createTexture2D(width, height, params)
    textures.write[name] = pico.createTexture2D(width, height, params)
    textures.read[name].data(
      new Float32Array(new Array(width * height * 4).fill(0))
    )
    textures.write[name].data(
      new Float32Array(new Array(width * height * 4).fill(0))
    )

    return textures[io][name]
  }
  rotateTexture(name) {
    const {textures} = this
    const t = textures.read[name]
    textures.read[name] = textures.write[name]
    textures.write[name] = t
  }
  constructor(options) {
    options = {...defaultOptions, ...options}

    const canvas = document.createElement('canvas')
    canvas.style.width = options.size * options.magnify + 'px'
    canvas.style.height = options.size * options.magnify + 'px'
    canvas.style.imageRendering = 'pixelated'
    canvas.setAttribute('width', options.size + 'px')
    canvas.setAttribute('height', options.size + 'px')

    const pico = PicoGL.createApp(canvas).clearColor(1.0, 1.0, 1.0, 1.0)

    this.options = options
    this.canvas = canvas
    this.pico = pico

    const oz = -1 + 2 / options.size
    this.quads.full = this.getQuad(-1, 1, -1, 1)
    this.quads.reduce1 = this.getQuad(-1, oz, -1, 1)
    this.quads.reduce2 = this.getQuad(-1, oz, -1, oz)
  }
  destroy() {
    for (const k in this.textures.read) this.textures.read[k].delete()
    for (const k in this.textures.write) this.textures.write[k].delete()
    this.destroyed = true
  }
}
