import PicoGL from 'picogl'
import vertexShader from './shaders/00-vertex.vert'
import fragShader from './shaders/01-display.frag'

const MAGNIFY = 4

export default class Simulation {
  options = null
  canvas = null
  pico = null
  programs = {}
  vertexArrayQuad: null
  io = {
    green: {texture: null, framebuffer: null},
    blue: {texture: null, framebuffer: null},
    read: 'green',
    write: 'blue',
  }
  async fragCompute(fragShader) {
    const {options, io, pico, programs, vertexArrayQuad} = this
    const readTexture = io[io.read].texture
    const writeFramebuffer = io[io.write].framebuffer

    let program
    if (programs[fragShader]) {
      program = programs[fragShader]
    } else {
      program = await pico.createProgram(vertexShader, fragShader)
      programs[fragShader] = program
    }

    const uniformBuffer = pico
      .createUniformBuffer([PicoGL.FLOAT, PicoGL.FLOAT])
      .set(0, options.width)
      .set(1, options.height)
      .update()

    const drawCall = pico
      .createDrawCall(program, vertexArrayQuad)
      .texture('tex', readTexture)
      .uniformBlock('SceneUniforms', uniformBuffer)

    pico.drawFramebuffer(writeFramebuffer).clear()
    drawCall.draw()
    io.read = io.read === 'blue' ? 'green' : 'blue'
    io.write = io.write === 'blue' ? 'green' : 'blue'
  }
  setData(data) {
    this.io[this.io.read].texture.data(data)
  }
  async display() {
    const {io, pico, programs, vertexArrayQuad} = this
    const readTexture = io[io.read].texture

    let program
    if (programs[fragShader]) {
      program = programs[fragShader]
    } else {
      program = await pico.createProgram(vertexShader, fragShader)
      programs[fragShader] = program
    }

    const drawCall = pico
      .createDrawCall(program, vertexArrayQuad)
      .texture('tex', readTexture)

    pico.defaultDrawFramebuffer().clear()
    drawCall.draw()
  }
  constructor(options) {
    this.options = options
    const canvas = document.createElement('canvas')
    canvas.style.height = options.width * MAGNIFY + 'px'
    canvas.style.width = options.height * MAGNIFY + 'px'
    canvas.style.imageRendering = 'pixelated'
    canvas.setAttribute('height', options.width + 'px')
    canvas.setAttribute('width', options.height + 'px')
    const pico = PicoGL.createApp(canvas).clearColor(1.0, 1.0, 1.0, 1.0)

    // prettier-ignore
    const quadGeom = new Float32Array([
      -1,-1,-1, 1, 1, 1,
      -1,-1, 1,-1, 1, 1,
    ])
    const quadVertexBuffer = pico.createVertexBuffer(PicoGL.FLOAT, 2, quadGeom)
    const quadVertexArray = pico
      .createVertexArray()
      .vertexAttributeBuffer(0, quadVertexBuffer)

    const greenTexture = pico.createTexture2D(options.width, options.height, {
      internalFormat: PicoGL.RGBA32F,
    })
    const blueTexture = pico.createTexture2D(options.width, options.height, {
      internalFormat: PicoGL.RGBA32F,
    })
    // prettier-ignore
    const greenFramebuffer = pico.createFramebuffer().colorTarget(0, greenTexture)
    const blueFramebuffer = pico.createFramebuffer().colorTarget(0, blueTexture)

    const io = {
      green: {texture: greenTexture, framebuffer: greenFramebuffer},
      blue: {texture: blueTexture, framebuffer: blueFramebuffer},
      read: 'green',
      write: 'blue',
    }

    this.vertexArrayQuad = quadVertexArray
    this.canvas = canvas
    this.pico = pico
    this.io = io
  }
}
