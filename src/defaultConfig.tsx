import {Noise} from 'noisejs'
import {defaultValues as display} from './DisplaySettings'

const noise = new Noise(Math.random())

// export const config = {
//   seed: -1,
//   size: 128,
//   transferRadius: 5,
//   substances: [
//     {name: 'A', arc: 0.015, flo: 0.5},
//     {name: 'B', arc: 0.999, flo: 1},
//     {name: 'W', arc: 0.99, flo: 0.0},
//   ],
//   substanceAttractionMatrix: {
//     A2W: 1,
//     B2W: 0,
//   },
//   reactionParameters: {},
//   reactions: [
//     'A -> B, input0.z > 0.0 ? 1.0 : 0.0',
//     'B -> A, input0.z > 0.0 ? 0.0 : 1.0',
//   ],
//   display,
// }

// export const texturePack = (x, y, size) => {
//   const cx = size / 2
//   const cy = size / 2
//   const wall = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5

//   return {
//     A: {energy: wall ? 0 : Math.random()},
//     // B: {energy: 0},
//     W: {energy: wall ? 1 : 0},
//   }
// }

// export const config = {
//   seed: -1,
//   size: 128,
//   transferRadius: 1,
//   substances: [
//     {name: 'A', arc: 0.65, flo: 0.5},
//     {name: 'B', arc: 0.65, flo: 0.5},
//     {name: 'C', arc: 0.65, flo: 0.5},
//     {name: 'D', arc: 0.65, flo: 0.5},
//     {name: 'E', arc: 0.65, flo: 0.5},
//     {name: 'F', arc: 0.65, flo: 0.5},
//     {name: 'W', arc: 0.999, flo: 0},
//   ],
//   substanceAttractionMatrix: {
//     A2A: 20,
//     B2B: 20,
//     C2C: 20,
//     D2D: 20,
//     E2E: 20,
//     F2F: 20,
//     A2W: 0,
//     B2W: 0,
//     C2W: 0,
//     D2W: 0,
//     E2W: 0,
//     F2W: 0,
//   },
//   reactionParameters: {},
//   reactions: [],
//   display,
// }

// export const texturePack = (x, y, size) => {
//   const cx = size / 2
//   const cy = size / 2
//   const wall = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5

//   return {
//     A: {energy: wall ? 0 : Math.random()},
//     B: {energy: wall ? 0 : Math.random()},
//     C: {energy: wall ? 0 : Math.random()},
//     D: {energy: wall ? 0 : Math.random()},
//     E: {energy: wall ? 0 : Math.random()},
//     F: {energy: wall ? 0 : Math.random()},
//     W: {energy: wall ? 1 : 0},
//   }
// }

// prettier-ignore
export const config = {
  seed: -1,
  size: 128,
  transferRadius: 1,
  substances: [
    {name: 'A', arc: 0.999, flo: 0.5},
    {name: 'B', arc: 0.999, flo: 0.5},
    {name: 'X', arc: 0.999, flo: 0.5},
    {name: 'D', arc: 0.999, flo: 0.5},
    {name: 'W', arc: 0.999, flo: 0},
  ],
  substanceAttractionMatrix: {
    A2X: 0, X2A: 0,
    A2B: 0, B2A: 0,
    B2D: 0,
    D2D: 300,
    X2D: 0,
    A2W: 0, B2W: 0, D2W: 0, X2W: 0,
  },
  reactionParameters: {},
  reactions: [
    'A -> B, 0.15',
    'B -> A, 0.15'
  ],
  display,
}

export const texturePack = (x, y, size) => {
  const cx = size / 2
  const cy = size / 2
  const wall = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5
  const dirt = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 < 10

  return {
    A: {energy: wall || dirt ? 0 : Math.random()},
    B: {energy: wall || dirt ? 0 : Math.random()},
    X: {energy: wall || dirt ? 0 : Math.random()},
    D: {energy: dirt ? 2 : 0},
    W: {energy: wall ? 1 : 0},
  }
}
