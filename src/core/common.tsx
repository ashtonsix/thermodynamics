const defaultSubstance = {
  symbol: null,
  arc: null,
  arcWeight: 1,
  arcBlending: 0,
  flo: null,
  floWeight: 1,
  floBlending: 0,
  dirWeight: 1,
  dirBlending: 0,
}

export function configToUniforms(config) {
  const substances = config.substances.slice()
  if (substances.length >= 4) {
    // prettier-ignore
    const s_ =  {...defaultSubstance}
    substances.splice(3, 0, s_)
  }
  const substanceAttribute = (offset, key) => {
    const a = new Array(4).fill(0)
    substances.slice(offset * 4, 4 + offset * 4).forEach((s, i) => {
      a[i] = s[key] || defaultSubstance[key] || 0
      if (key === 'arc') a[i] *= Math.PI
    })
    return a
  }

  let transferRadius = config.transferRadius
  if (transferRadius - 0.5 === Math.floor(transferRadius))
    transferRadius -= 0.000001

  const am = new Array(8).fill(null).map(() => new Array(8).fill(1))
  for (const k in config.substanceAttractionMatrix) {
    const [a, b] = k.split('2')
    const v = config.substanceAttractionMatrix[k]
    const ai = substances.findIndex((s) => s.symbol === a)
    const bi = substances.findIndex((s) => s.symbol === b)
    if (ai === -1 || bi === -1) continue
    am[ai][bi] = v
  }

  // prettier-ignore
  const uniforms = {
    static: [config.size, transferRadius],
    substance: [
      substanceAttribute(0, 'arc'), substanceAttribute(0, 'arcWeight'), substanceAttribute(0, 'arcBlending'),
      substanceAttribute(0, 'flo'), substanceAttribute(0, 'floWeight'), substanceAttribute(0, 'floBlending'),
                                    substanceAttribute(0, 'dirWeight'), substanceAttribute(0, 'dirBlending'),
      substanceAttribute(1, 'arc'), substanceAttribute(1, 'arcWeight'), substanceAttribute(1, 'arcBlending'),
      substanceAttribute(1, 'flo'), substanceAttribute(1, 'floWeight'), substanceAttribute(1, 'floBlending'),
                                    substanceAttribute(1, 'dirWeight'), substanceAttribute(1, 'dirBlending'),
    ],
    substanceAttractionMatrix: [
      [am[0][0],am[0][1],am[0][2],am[0][3]], [am[1][0],am[1][1],am[1][2],am[1][3]],
      [am[2][0],am[2][1],am[2][2],am[2][3]], [am[3][0],am[3][1],am[3][2],am[3][3]],
      [am[4][0],am[4][1],am[4][2],am[4][3]], [am[5][0],am[5][1],am[5][2],am[5][3]],
      [am[6][0],am[6][1],am[6][2],am[6][3]], [am[7][0],am[7][1],am[7][2],am[7][3]],
      [am[0][4],am[0][5],am[0][6],am[0][7]], [am[1][4],am[1][5],am[1][6],am[1][7]],
      [am[2][4],am[2][5],am[2][6],am[2][7]], [am[3][4],am[3][5],am[3][6],am[3][7]],
      [am[4][4],am[4][5],am[4][6],am[4][7]], [am[5][4],am[5][5],am[5][6],am[5][7]],
      [am[6][4],am[6][5],am[6][6],am[6][7]], [am[7][4],am[7][5],am[7][6],am[7][7]],
    ],
  }

  return uniforms
}

export function generateTextures(generator, config) {
  let data = new Array(config.size)
    .fill(null)
    .map((_, y) =>
      new Array(config.size)
        .fill(null)
        .map((_, x) => generator(x, y, config.size))
    )

  let textureCount = config.substances.length
  if (textureCount >= 4) textureCount += 1

  let textures = {}
  // prettier-ignore
  let indices = [[0, 1], [2, -1], [3, 4], [5, 6]].slice(0, Math.ceil(textureCount / 2));
  for (let [i, j] of indices) {
    let texture = new Array(config.size).fill(null).map((_, y) =>
      new Array(config.size).fill(null).map((_, x) => {
        const s0 = config.substances[i]?.symbol
        const s1 = config.substances[j]?.symbol
        let e0 = data[y][x][s0]?.energy || 0
        let d0 = data[y][x][s0]?.direction || Math.random() * Math.PI * 2
        let e1 = data[y][x][s1]?.energy || 0
        let d1 = data[y][x][s1]?.direction || Math.random() * Math.PI * 2
        return [
          Math.cos(d0) * e0,
          Math.sin(d0) * e0,
          Math.cos(d1) * e1,
          Math.sin(d1) * e1,
        ]
      })
    )
    if (i >= 3) i++
    textures[`s${i}${i + 1}`] = texture
  }
  return textures
}

export function substanceReactParse(config) {
  const reactionStrings = config.reactions
  const symbols = new Array(8).fill('')
  config.substances.forEach((s, i) => {
    if (i >= 3) i += 1
    symbols[i] = s.symbol
  })
  if (Array.from(new Set(symbols)).length < config.substances.length + 1) {
    throw new Error('Every symbol must be unique')
  }
  if (config.substances.includes((s) => /[^A-Z]/.test(s.symbol))) {
    throw new Error('Symbols can only include capitalised letters')
  }
  symbols.push(...['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'])

  /**
   * 'A + B -> 2A, 1.0' =>
   * input: [{quantity: 1, symbol: 'A'}, {quantity: 1, symbol: 'B'}],
   * output: [{quantity: 2, symbol: 'A'}],
   * weight: 1
   */
  const reactions = reactionStrings
    .map((text) => {
      const [, input, output, weight] = text.match(/(.+)->(.+),(.+)/)
      const reaction = {
        text,
        input: input.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/)
          return {quantity: +(quantity || '1'), symbol}
        }),
        output: output.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/)
          return {quantity: +(quantity || '1'), symbol}
        }),
        weight: weight.trim(),
      }
      if (
        reaction.input.reduce((pv, v) => pv + v.quantity, 0) !==
        reaction.output.reduce((pv, v) => pv + v.quantity, 0)
      ) {
        throw new Error(
          `Every reaction must be balanced ('${reaction.text}' is not)`
        )
      }
      let inputAddresses = {}
      reaction.input.forEach(({symbol}) => {
        if (/a[0-7]/.test(symbol)) inputAddresses[symbol] = true
      })
      reaction.output.forEach(({symbol}) => {
        if (inputAddresses[symbol]) {
          throw new Error(
            `An address cannot send energy to itself (${symbol} -> ${symbol})`
          )
        }
      })
      return reaction
    })
    .map((reaction) => {
      const input = new Array(16).fill(0)
      const output = new Array(16).fill(0)
      reaction.input.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol)
        if (index === -1) throw new Error(`${symbol} is not a defined symbol`)
        input[index] += quantity
      })
      reaction.output.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol)
        if (index === -1) throw new Error(`${symbol} is not a defined symbol`)
        output[index] += quantity
      })
      // TODO: parse weight
      // all symbols in equation must be described elsewhere.
      // weight must simultaneously be a valid JavaScript and GLSL expression which yields a float
      // must not contain a semicolon
      // prettier-ignore
      return {
        uniforms: [
          input.slice(0, 4), input.slice(4, 8), input.slice(8, 12), input.slice(12, 16),
          output.slice(0, 4), output.slice(4, 8), output.slice(8, 12), output.slice(12, 16),
        ],
        weight: reaction.weight,
      };
    })

  return reactions
}
