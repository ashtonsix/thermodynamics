import {Noise} from 'noisejs'
import {defaultValues as display} from './DisplaySettings'

const noise = new Noise(Math.random())

export const config = {
  seed: -1,
  size: 512,
  transferRadius: 2,
  substances: [
    {name: 'A', arc: 0.7, flo: 0.5},
    {name: 'B', arc: 0.999999, flo: 1},
    {name: 'W', arc: 0.99, flo: 0.0},
  ],
  substanceAttractionMatrix: {
    A2W: 1,
    B2W: 0,
  },
  reactionParameters: {},
  reactions: [
    'A -> B, input0.z > 0.0 ? 1.0 : 0.0',
    'B -> A, input0.z > 0.0 ? 0.0 : 1.0',
  ],
  display,
}

export const texturePack = (x, y, size) => {
  const cx = size / 2
  const cy = size / 2
  const wall = false // ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5

  return {
    A: {
      energy: wall ? 0 : Math.random(),
    },
    W: {energy: wall ? 1 : 0},
  }
}

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
//     A2W: 1,
//     B2W: -2000000,
//     C2W: -2000000,
//     D2W: -2000000,
//     E2W: -2000000,
//     F2W: -2000000,
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

// // prettier-ignore
// export const config = {
//   seed: -1,
//   size: 256,
//   transferRadius: 2,
//   substances: [
//     {name: 'Head', arc: 0.999, flo: 0.02},
//     {name: 'Tail', arc: 0.999, flo: 0.02},
//     {name: 'Aqua', arc: 0.97, flo: 0.02},
//     {name: 'Dirt', arc: 0.999, flo: 0.95},
//   ],
//   substanceAttractionMatrix: {
//     Head2Aqua: 30, Head2Dirt: -5,
//     Tail2Aqua: -5, Tail2Dirt: 30,
//     Aqua2Dirt: -5,
//     Dirt2Aqua: -5,
//   },
//   reactionParameters: {},
//   reactions: [
//     'Head -> Tail, 0.9',
//     'Tail -> Head, 0.9',
//     'Dirt -> Aqua, 0.00006',
//     'Aqua -> Dirt, 0.00005'
//   ],
//   display,
// }

// export const texturePack = (x, y, size) => {
//   const cx = size / 2
//   const cy = size / 2
//   const dirt = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 < 1

//   return {
//     Head: {energy: Math.random()},
//     Aqua: {energy: Math.random()},
//     Dirt: {energy: dirt ? 10000 : 0},
//   }
// }
