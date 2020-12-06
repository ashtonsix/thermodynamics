// prettier-ignore
export const config = {
  seed: -1,
  size: 200,
  transferRadius: 1,
  substances: [
    {symbol: 'A', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'B', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'C', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'D', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'E', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'F', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'G', arc: Math.PI * (2 / 3), arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
  ],
  substanceAttractionMatrix: {
    '00': 1, '01': 1, '02': 1, '03': 1, '04': 1, '05': 1, '06': 1, '07': 1,
    '10': 1, '11': 1, '12': 1, '13': 1, '14': 1, '15': 1, '16': 1, '17': 1,
    '20': 1, '21': 1, '22': 1, '23': 1, '24': 1, '25': 1, '26': 1, '27': 1,
    '30': 1, '31': 1, '32': 1, '33': 1, '34': 1, '35': 1, '36': 1, '37': 1,
    '40': 1, '41': 1, '42': 1, '43': 1, '44': 1, '45': 1, '46': 1, '47': 1,
    '50': 1, '51': 1, '52': 1, '53': 1, '54': 1, '55': 1, '56': 1, '57': 1,
    '60': 1, '61': 1, '62': 1, '63': 1, '64': 1, '65': 1, '66': 1, '67': 1,
    '70': 1, '71': 1, '72': 1, '73': 1, '74': 1, '75': 1, '76': 1, '77': 1,
  },
  reactionParameters: {},
  reactions: [
    // "A + B -> 2C, 0.12",
    // "B + C -> 2A, 0.10",
    // "C + A -> 2B, 0.10",
  ],
}

export function configToUniforms(config) {
  const substances = config.substances.slice();
  if (substances.length >= 4) {
    // prettier-ignore
    const s_ =  {symbol: 'H', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0}
    substances.splice(3, 0, s_);
  }
  const substanceAttribute = (offset, key) => {
    const a = new Array(4).fill(0);
    substances.slice(offset * 4, 4 + offset * 4).forEach((s, i) => {
      a[i] = s[key];
    });
    return a;
  };
  const am = config.substanceAttractionMatrix;

  let transferRadius = config.transferRadius;
  if (transferRadius - 0.5 === Math.floor(transferRadius)) transferRadius -= 0.000001;

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
      [am['00'],am['01'],am['02'],am['03']], [am['10'],am['11'],am['12'],am['13']],
      [am['20'],am['21'],am['22'],am['23']], [am['30'],am['31'],am['32'],am['33']],
      [am['40'],am['41'],am['42'],am['43']], [am['50'],am['51'],am['52'],am['53']],
      [am['60'],am['61'],am['62'],am['63']], [am['70'],am['71'],am['72'],am['73']],
      [am['04'],am['05'],am['06'],am['07']], [am['14'],am['15'],am['16'],am['17']],
      [am['24'],am['25'],am['26'],am['27']], [am['34'],am['35'],am['36'],am['37']],
      [am['44'],am['45'],am['46'],am['47']], [am['54'],am['55'],am['56'],am['57']],
      [am['64'],am['65'],am['66'],am['67']], [am['74'],am['75'],am['76'],am['77']],
    ],
  }

  return uniforms;
}

export function generateTextures(generators, size) {
  generators = generators.slice();
  if (generators.length >= 4) {
    generators.splice(3, 0, {energy: () => 0.0, direction: () => 0.0});
  }
  let textures = {};
  for (let i = 0; i < generators.length; i += 2) {
    let texture = new Array(size).fill(null).map((_, y) =>
      new Array(size).fill(null).map((_, x) => {
        let e0 = generators[i].energy(x, y, size);
        let d0 = generators[i].direction(x, y, size);
        let e1 = 0;
        let d1 = 0;
        if (generators[i + 1]) {
          e1 = generators[i + 1].energy(x, y, size);
          d1 = generators[i + 1].direction(x, y, size);
        }
        return [Math.cos(d0) * e0, Math.sin(d0) * e0, Math.cos(d1) * e1, Math.sin(d1) * e1];
      })
    );
    textures[`s${i}${i + 1}`] = texture;
  }
  return textures;
}

export function substanceReactParse(config) {
  const reactionStrings = config.reactions;
  const symbols = new Array(8).fill('');
  config.substances.forEach((s, i) => {
    symbols[i] = s.symbol;
  });
  symbols.push(...['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']);
  if (config.substances.includes((s) => /a[0-7]/.test(s.symbol))) {
    throw new Error('Symbols cannot take the form of a0, a1, a2... they are reserved');
  }
  if (Array.from(new Set(symbols)).length < Math.min(config.substances.length + 9, 16)) {
    throw new Error('Every symbol must be unique');
  }

  /**
   * 'A + B -> 2A, 1.0' =>
   * input: [{quantity: 1, symbol: 'A'}, {quantity: 1, symbol: 'B'}],
   * output: [{quantity: 2, symbol: 'A'}],
   * weight: 1
   */
  const reactions = reactionStrings
    .map((text) => {
      const [, input, output, weight] = text.match(/(.+)->(.+),(.+)/);
      const reaction = {
        text,
        input: input.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/);
          return {quantity: +(quantity || '1'), symbol};
        }),
        output: output.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/);
          return {quantity: +(quantity || '1'), symbol};
        }),
        weight: weight.trim(),
      };
      if (
        reaction.input.reduce((pv, v) => pv + v.quantity, 0) !== reaction.output.reduce((pv, v) => pv + v.quantity, 0)
      ) {
        throw new Error(`Every reaction must be balanced ('${reaction.text}' is not)`);
      }
      let inputAddresses = {};
      reaction.input.forEach(({symbol}) => {
        if (/a[0-7]/.test(symbol)) inputAddresses[symbol] = true;
      });
      reaction.output.forEach(({symbol}) => {
        if (inputAddresses[symbol]) {
          throw new Error(`An address cannot send energy to itself (${symbol} -> ${symbol})`);
        }
      });
      return reaction;
    })
    .map((reaction) => {
      const input = new Array(16).fill(0);
      const output = new Array(16).fill(0);
      reaction.input.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol);
        if (index === -1) {
          throw new Error(`${symbol} is not a defined symbol`);
        }
        input[index] += quantity;
      });
      reaction.output.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol);
        if (index === -1) {
          throw new Error(`${symbol} is not a defined symbol`);
        }
        output[index] += quantity;
      });
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
    });

  return reactions;
}
