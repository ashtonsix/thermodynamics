import {PicoGL} from 'picogl/build/module/picogl'
import quadShader from './shaders2/quad.vert'
import reduce1Shader from './shaders2/reduce1.frag'
import reduce2Shader from './shaders2/reduce2.frag'

export default class ShaderBridge {
  destroyed = false
  canvas = null
  pico = null
  programs = {}
  size = null
  uniforms = {}
  quads = {full: null, reduce1: null, reduce2: null}
  textures = {read: {}, write: {}}
  async compute(fragShader, texturesIn, texturesOut) {
    await this.draw(fragShader, texturesIn, texturesOut, 'full')
  }
  async display(fragShader, texturesIn) {
    await this.draw(fragShader, texturesIn, 'screen', 'full')
  }
  async reduce(textureIn: string, textureOut: string) {
    await this.draw(reduce1Shader, [textureIn], ['reduce1'], 'reduce1')
    await this.draw(reduce2Shader, ['reduce1'], [textureOut], 'reduce2')
  }
  async draw(fragShader, texturesIn, texturesOut, quadName) {
    const {pico, uniforms, programs} = this
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
        'texture' + i,
        this.getTexture(texturesIn[i], 'read', 'full')
      )
    }
    for (const k in uniforms) {
      const blockName = k[0].toUpperCase() + k.slice(1) + 'Uniforms'
      const data = uniforms[k]
      const uniformBuffer = pico.createUniformBuffer(
        data.map((d) =>
          typeof d === 'number'
            ? PicoGL.FLOAT
            : d.length === 2
            ? PicoGL.FLOAT_VEC2
            : PicoGL.FLOAT_VEC4
        )
      )
      data.forEach((v, i) => uniformBuffer.set(i, v))
      uniformBuffer.update()
      drawCall.uniformBlock(blockName, uniformBuffer)
    }

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
      let texture = textures[k]
      texture = [].concat(...texture)
      texture = [].concat(...texture)
      texture = new Float32Array(texture)
      this.getTexture(k, 'read', 'full').data(texture)
      this.getTexture(k, 'write', 'full').data(texture)
    }
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
    const {pico, textures, size} = this
    const [width, height] = {
      full: [size, size],
      reduce1: [1, size],
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
  constructor(size) {
    this.size = size

    const canvas = document.createElement('canvas')
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    canvas.style.imageRendering = 'pixelated'
    canvas.setAttribute('width', size + 'px')
    canvas.setAttribute('height', size + 'px')

    const pico = PicoGL.createApp(canvas).clearColor(1.0, 1.0, 1.0, 1.0)

    this.canvas = canvas
    this.pico = pico

    const oz = -1 + 2 / size
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
