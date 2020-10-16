import 'react'
const {floor, abs, min} = Math
const mod = (v, m) => ((v % m) + m) % m

// prettier-ignore
const circle = [
  0., 6., 1., 6., 2., 6., 3., 5., 4., 5., 5., 4., 5., 3., 6., 2., 6., 1., 6., 0., 6., -1., 6., -2., 5., -3., 5., -4., 4., -5., 3., -5., 2., -6., 1., -6., 0., -6., -1., -6., -2., -6., -3., -5., -4., -5., -5., -4., -5., -3., -6., -2., -6., -1., -6., 0., -6., 1., -6., 2., -5., 3., -5., 4., -4., 5., -3., 5., -2., 6., -1., 6.
]

const xy2i = (x, y) => {
  let r = abs(x) / abs(y)
  r = !isFinite(r) ? 0 : r >= 1 ? 1 / r : r
  // prettier-ignore
  return r < 0.25 ? r < 0.08333333333333333 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 0 : 9 : abs(y) >= abs(x) ? 18 : 9 : y >= 0. ? abs(y) >= abs(x) ? 0 : 27 : abs(y) >= abs(x) ? 18 : 27 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 1 : 8 : abs(y) >= abs(x) ? 17 : 10 : y >= 0. ? abs(y) >= abs(x) ? 35 : 28 : abs(y) >= abs(x) ? 19 : 26 : r < 0.4666666666666667 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 2 : 7 : abs(y) >= abs(x) ? 36 : 11 : y >= 0. ? abs(y) >= abs(x) ? 34 : 29 : abs(y) >= abs(x) ? 20 : 25 : r < 0.7 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 3 : 6 : abs(y) >= abs(x) ? 15 : 12 : y >= 0. ? abs(y) >= abs(x) ? 33 : 30 : abs(y) >= abs(x) ? 21 : 24 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 4 : 5 : abs(y) >= abs(x) ? 14 : 13 : y >= 0. ? abs(y) >= abs(x) ? 32 : 31 : abs(y) >= abs(x) ? 22 : 23;
}

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
      let xd = 0
      let yd = 0
      for (let i = 0; i < 36; i++) {
        const cx = circle[i * 2]
        const cy = circle[i * 2 + 1]
        const c =
          state[mod(iy + cy, state.length)][mod(ix + cx, state[0].length)]
        const j = xy2i(c.x, c.y)

        const diff = min(abs(i - j), abs(i + 36 - j), abs(i - (j + 36)))
        const max_diff = floor((1 - min(abs(c.x) + abs(c.y), 1)) * 19)

        if (diff <= max_diff) {
          const p = (abs(c.x) + abs(c.y)) / min(max_diff * 2 + 1, 36)
          const xd_ = -(p * cx) / (abs(cx) + abs(cy))
          const yd_ = -(p * cy) / (abs(cx) + abs(cy))
          xd += xd_
          yd += yd_
          mag += abs(xd_) + abs(yd_)
        }
      }

      const c = state[iy][ix]
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
  let grid = Array(30)
    .fill(undefined)
    .map(() =>
      Array(30)
        .fill(undefined)
        .map(() => ({x: Math.random() * 2 - 1, y: Math.random() * 2 - 1}))
    )

  grid[10][10] = {x: 1.7, y: 0}

  console.log('total', getTotal(grid))
  for (let i = 0; i < 200; i++) {
    grid = doItOnce(grid)
    console.log('total', getTotal(grid))
  }

  return grid
    .map((row) =>
      row
        .map(({x, y}) => (x.toFixed(2) + ',' + y.toFixed(2)).padStart(11))
        .join(' ')
    )
    .join('\n')
}
