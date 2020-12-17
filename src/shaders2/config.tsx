import {Noise} from 'noisejs';

const noise = new Noise(Math.random());

export const display = {frameRate: 10, magnify: 2};

// prettier-ignore
export const config = {
  seed: -1,
  size: 512,
  transferRadius: 5,
  substances: [
    {symbol: 'A', arc: 0.5, flo: 0.5},
    // {symbol: 'B', arc: 0.999, flo: 1}, 
    // {symbol: 'W', arc: 0.99, flo: 0.0},
  ],
  substanceAttractionMatrix: {
    // A2W: 1, B2W: 0,
  },
  reactionParameters: {},
  reactions: [
    // 'A -> B, input0.z > 0.0 ? 1.0 : 0.0',
    // 'B -> A, input0.z > 0.0 ? 0.0 : 1.0'
  ],
}

export const texturePack = (x, y, size) => {
  const cx = size / 2;
  const cy = size / 2;
  const wall = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5;

  return {
    A: {energy: Math.random()},
    B: {energy: 0},
    W: {energy: wall ? 0 : 0},
  };
};
