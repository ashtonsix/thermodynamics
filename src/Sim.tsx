import PicoGL from 'picogl'
import vertexShader from './shaders/00-vertex.vert'
import fragShader from './shaders/01-display.frag'

const MAGNIFY = 3

export default class Simulation {
  options = null
  canvas = null
  pico = null
  programs = {}
  vertexArrayQuad: null
  io = {
    green: {texture1: null, texture2: null, framebuffer: null},
    blue: {texture1: null, texture2: null, framebuffer: null},
    read: 'green',
    write: 'blue',
  }
  async fragCompute(fragShader) {
    const {options, io, pico, programs, vertexArrayQuad} = this
    const readTexture1 = io[io.read].texture1
    const readTexture2 = io[io.read].texture2
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
      .texture('texture1', readTexture1)
      .texture('texture2', readTexture2)
      .uniformBlock('SceneUniforms', uniformBuffer)

    pico.drawFramebuffer(writeFramebuffer).clear()
    drawCall.draw()
    io.read = io.read === 'blue' ? 'green' : 'blue'
    io.write = io.write === 'blue' ? 'green' : 'blue'
  }
  setData(data1, data2) {
    this.io[this.io.read].texture1.data(data1)
    this.io[this.io.read].texture2.data(data2)
  }
  async display() {
    const {io, pico, programs, vertexArrayQuad} = this
    const readTexture1 = io[io.read].texture1
    const readTexture2 = io[io.read].texture2

    let program
    if (programs[fragShader]) {
      program = programs[fragShader]
    } else {
      program = await pico.createProgram(vertexShader, fragShader)
      programs[fragShader] = program
    }

    const drawCall = pico
      .createDrawCall(program, vertexArrayQuad)
      .texture('texture1', readTexture1)
      .texture('texture2', readTexture2)

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

    const textureParams = [
      options.width,
      options.height,
      {internalFormat: PicoGL.RGBA32F},
    ]
    const greenTexture1 = pico.createTexture2D(...textureParams)
    const greenTexture2 = pico.createTexture2D(...textureParams)
    const blueTexture1 = pico.createTexture2D(...textureParams)
    const blueTexture2 = pico.createTexture2D(...textureParams)
    const greenFramebuffer = pico
      .createFramebuffer()
      .colorTarget(0, greenTexture1)
      .colorTarget(1, greenTexture2)
    const blueFramebuffer = pico
      .createFramebuffer()
      .colorTarget(0, blueTexture1)
      .colorTarget(1, blueTexture2)

    const io = {
      green: {
        texture1: greenTexture1,
        texture2: greenTexture2,
        framebuffer: greenFramebuffer,
      },
      blue: {
        texture1: blueTexture1,
        texture2: blueTexture2,
        framebuffer: blueFramebuffer,
      },
      read: 'green',
      write: 'blue',
    }

    this.vertexArrayQuad = quadVertexArray
    this.canvas = canvas
    this.pico = pico
    this.io = io
  }
}
