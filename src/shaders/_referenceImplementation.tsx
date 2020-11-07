import 'react'
const mod = (v, m) => ((v % m) + m) % m

const {sin, cos, atan2, min, max, floor, round, abs, PI} = Math

const loBounds = [
  3.534291735288517, // PI*9/8
  4.319689898685965, // PI*11/8
  5.105088062083414, // PI*13/8
  2.748893571891069, // PI*7/8
  0,
  5.890486225480862, // PI*15/8
  1.963495408493621, // PI*5/8
  1.178097245096172, // PI*3/8
  0.392699081698724, // PI*1/8
]

const getDisplace = (e, i, arcFull) => {
  let loBound = loBounds[i]
  let hiBound = loBound + PI * (2 / 8)
  let bisector = atan2(e.y, e.x)

  let loUnbounded = (bisector - arcFull + PI * 2) % (PI * 2)
  let hiUnbounded = (bisector + arcFull + PI * 2) % (PI * 2)
  if (loUnbounded > hiUnbounded) hiUnbounded += PI * 2
  if (hiBound < loUnbounded) {
    loUnbounded -= PI * 2
    hiUnbounded -= PI * 2
  } else if (loBound > hiUnbounded) {
    loUnbounded += PI * 2
    hiUnbounded += PI * 2
  }
  let lo = max(min(loUnbounded, hiBound), loBound)
  let hi = max(min(hiUnbounded, hiBound), loBound)
  let theta = (lo + hi) / 2
  let arc = hi - lo
  if (theta >= PI) theta -= PI * 2

  let scalar =
    ((abs(e.x) + abs(e.y)) * (arc / (arcFull * 2))) /
    (abs(cos(theta)) + abs(sin(theta)))

  return {x: cos(theta) * scalar, y: sin(theta) * scalar}
}

const centripetalFactor = 0.5

const doItOnce = (state) => {
  const nextState = Array(state.length)
    .fill(undefined)
    .map(() =>
      Array(state[0].length)
        .fill(undefined)
        .map(() => ({x: 0, y: 0}))
    )

  for (let iy = 0; iy < state.length; iy++) {
    for (let ix = 0; ix < state[iy].length; ix++) {
      let mag = 0
      for (let i = 0; i < 9; i++) {
        if (i === 4) continue
        const cx = mod(i, 3) - 1
        const cy = floor(i / 3) - 1
        const cc =
          state[mod(iy + cy, state.length)][mod(ix + cx, state[0].length)]

        const e = getDisplace(cc, i, PI * 0.25)
        mag += abs(e.x) + abs(e.y)
      }
      state[iy][ix].z = mag
    }
  }

  for (let iy = 0; iy < state.length; iy++) {
    for (let ix = 0; ix < state[iy].length; ix++) {
      let mag = 0
      let xd = 0
      let yd = 0
      const c = state[iy][ix]
      for (let i = 0; i < 9; i++) {
        if (i === 4) continue
        const cx = mod(i, 3) - 1
        const cy = floor(i / 3) - 1
        const cc =
          state[mod(iy + cy, state.length)][mod(ix + cx, state[0].length)]

        let j = (-cy + 1) * 3 + -cx + 1
        const e1 = getDisplace(cc, j, PI * 0.25)
        const e2 = getDisplace(c, j, PI * 0.25)

        xd += e1.x * (1 - centripetalFactor)
        yd += e1.y * (1 - centripetalFactor)
        mag +=
          (abs(e1.x) + abs(e1.y)) * (1 - centripetalFactor) +
          (abs(e2.x) + abs(e2.y)) *
            ((abs(cc.x) + abs(cc.y)) / cc.z) *
            centripetalFactor
      }

      xd = (c.x + xd) * 0.5
      yd = (c.y + yd) * 0.5
      mag = (mag + abs(c.x) + abs(c.y)) * 0.5

      if (!xd) xd += 0.0000001
      if (!yd) yd += 0.0000001

      let mult = mag / (abs(xd) + abs(yd))
      mult = isNaN(mult) || !isFinite(mult) ? 1 : mult

      nextState[iy][ix] = {
        x: xd * mult,
        y: yd * mult,
      }
    }
  }

  return nextState
}

const getTotal = (grid) => {
  return grid.reduce(
    (pv, row) => pv + row.reduce((pv, {x, y}) => pv + abs(x) + abs(y), 0),
    0
  )
}

export default function test() {
  let grid = Array(20)
    .fill(undefined)
    .map(() =>
      Array(20)
        .fill(undefined)
        .map(() => ({x: 0.01, y: 0}))
    )

  grid[10][1] = {x: 10, y: 0}

  for (let i = 0; i < 50; i++) {
    grid = doItOnce(grid)
  }

  return grid
    .map((row) =>
      row
        .map(({x, y}) => (x.toFixed(2) + ',' + y.toFixed(2)).padStart(11))
        .join(' ')
    )
    .join('\n')
}

const getNextBound = (value) => {
  let [ix, iy, it, radius] = value
  let ox = 0
  let oy = 0
  let ot = 7
  if (it < PI && abs(ix - 0.5) < radius) {
    let x = ix - 0.5
    let y = (radius ** 2 - x ** 2) ** 0.5
    let t = atan2(y, x)
    if (t < 0) t += 2 * PI
    if (t < ot) {
      ox = ix - 1
      oy = iy
      ot = t
    }
  }
  if ((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) {
    let y = iy + 0.5
    let x = (radius ** 2 - y ** 2) ** 0.5
    let t = atan2(y, x)
    if (t < 0) t += 2 * PI
    if (t < ot) {
      ox = ix
      oy = iy + 1
      ot = t
    }
  }
  if (it >= PI && abs(ix + 0.5) < radius) {
    let x = ix + 0.5
    let y = -((radius ** 2 - x ** 2) ** 0.5)
    let t = atan2(y, x)
    if (t < 0) t += 2 * PI
    if (t < ot) {
      ox = ix + 1
      oy = iy
      ot = t
    }
  }
  if (it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) {
    let y = iy - 0.5
    let x = -((radius ** 2 - y ** 2) ** 0.5)
    let t = atan2(y, x)
    if (t < 0) t += 2 * PI
    if (t < ot) {
      ox = ix
      oy = iy - 1
      ot = t
    }
  }
  return [ox, oy, ot, radius]
}

let transferRadius = 2 ** 0.5 / 2 + 0.00001
let prevBound
let nextBound = getNextBound([round(transferRadius), 0, 0, transferRadius])
while (true) {
  prevBound = nextBound
  nextBound = getNextBound(prevBound)

  let loBound = prevBound[2]
  let hiBound = nextBound[2]
  if (loBound > hiBound) hiBound += 2 * PI
  else if (hiBound - loBound < 0.0001) continue
  console.log(prevBound.slice(0, 2), (hiBound - loBound) / PI)
  if (hiBound > 2 * PI) {
    break
  }
}
