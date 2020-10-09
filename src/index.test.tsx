import 'react'

// prettier-ignore
const circ_7 = [
  3., 0.,
  3., 1.,
  2., 2.,
  1., 3.,
  0., 3.,
  -1., 3.,
  -2., 2.,
  -3., 1.,
  -3., 0.,
  -3., -1.,
  -2., -2.,
  -1., -3.,
  0., -3.,
  1., -3.,
  2., -2.,
  3., -1.
]

// prettier-ignore
const circ_7_index = [
  -1, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 9, -1, 7, -1, -1, -1, -1, -1, 10, -1, -1, -1, 6, -1, -1, -1, 11, -1, -1, -1, -1, -1, 5, -1, 12, -1, -1, -1, -1, -1, -1, -1, 4, -1, 13, -1, -1, -1, -1, -1, 3, -1, -1, -1, 14, -1, -1, -1, 2, -1, -1, -1, -1, -1, 15, -1, 1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1
]

const {floor, abs, min} = Math

const mod = (v, m) => ((v % m) + m) % m

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
      for (let ci = 0; ci < 16; ci++) {
        const c7x = circ_7[ci * 2]
        const c7y = circ_7[ci * 2 + 1]
        const c =
          state[mod(iy + c7y, state.length)][mod(ix + c7x, state[0].length)]
        const cj =
          (circ_7_index[
            floor((c.x / (abs(c.x) + abs(c.y))) * 4 + 4.5) * 9 +
              floor((c.y / (abs(c.x) + abs(c.y))) * 4 + 4.5)
          ] +
            8) %
          16
        const diff = min(abs(ci - cj), abs(ci + 16 - cj), abs(ci - (cj + 16)))
        const max_diff = floor((1 - min(abs(c.x) + abs(c.y), 1)) * 9)
        if (diff <= max_diff) {
          const p = (abs(c.x) + abs(c.y)) / min(max_diff * 2 + 1, 16)
          const xd_ = -(p * c7x) / (abs(c7x) + abs(c7y))
          const yd_ = -(p * c7y) / (abs(c7x) + abs(c7y))
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

test('it works', () => {
  let grid = Array(7)
    .fill(undefined)
    .map(() =>
      Array(7)
        .fill(undefined)
        .map(() => ({x: 0, y: 0}))
    )

  grid[3][5] = {x: 1.7, y: 0}

  console.log('total', getTotal(grid))
  for (let i = 0; i < 2; i++) {
    grid = doItOnce(grid)
    console.log('total', getTotal(grid))
  }

  console.log(
    grid
      .map((row) =>
        row
          .map(({x, y}) => (x.toFixed(2) + ',' + y.toFixed(2)).padStart(11))
          .join(' ')
      )
      .join('\n')
  )
})
