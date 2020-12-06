// prettier-ignore
export const config = {
  seed: -1,
  size: 100,
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
    '00': 1, '01': 0.01, '02': 1, '03': 1, '04': 1, '05': 1, '06': 1, '07': 1,
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

const PI2 = Math.PI * 2;

export const texturePack = [
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => Math.random() * PI2,
  },
  {
    energy: (x, y, size) => {
      return 0.0000000000000000001;
      // const r = config.size / 2 - 1;
      // return x < h
      //   ? ((x - h) ** 2 + (y - h) ** 2) ** 0.5 > r
      //     ? 1
      //     : 0
      //   : x < 2 || y < 2 || x > config.size - 2 || y > config.size - 2
      //   ? 1
      //   : 0;
    },
    direction: (x, y, size) => Math.random() * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
  {
    energy: (x, y, size) => 0,
    direction: (x, y, size) => 0 * PI2,
  },
];

export const display = {frameRate: 2, magnify: 8};
