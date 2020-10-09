import PicoGL from 'picogl'
import vertexShader from './shaders/00-vertex.vert'
import fragShader from './shaders/01-display.frag'

const WIDTH = 400
const HEIGHT = 400
const MAGNIFY = 2

export default class Simulation {
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
    const {io, pico, programs, vertexArrayQuad} = this
    const readTexture = io[io.read].texture
    const writeFramebuffer = io[io.write].framebuffer

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
  constructor() {
    const canvas = document.createElement('canvas')
    canvas.style.height = WIDTH * MAGNIFY + 'px'
    canvas.style.width = HEIGHT * MAGNIFY + 'px'
    canvas.style.imageRendering = 'pixelated'
    canvas.setAttribute('height', WIDTH + 'px')
    canvas.setAttribute('width', HEIGHT + 'px')
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

    const greenTexture = pico.createTexture2D(WIDTH, HEIGHT, {
      internalFormat: PicoGL.RGBA32F,
    })
    const blueTexture = pico.createTexture2D(WIDTH, HEIGHT, {
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
