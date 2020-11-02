const {sin, cos, atan2, min, max, round, abs, PI} = Math

const chunk = (arr, sz) => {
  const next = []
  for (let i = 0; i < arr.length; i += sz) {
    next.push(arr.slice(i, i + sz))
  }
  return next
}

const printf = (n) => n.toFixed(2).padStart(5, ' ')

export function mapThetaToKernel1(bisector) {
  const arc = PI * 0.25
  // const bisector = PI

  let result
  result = new Array(9 * 3).fill(0)
  for (
    let theta = bisector - arc;
    theta <= bisector + arc;
    theta += PI * 0.0001
  ) {
    const x = cos(theta)
    const y = sin(theta)
    const i = round(y + 1) * 3 + round(x + 1)
    result[i * 3] += x
    result[i * 3 + 1] += y
    result[i * 3 + 2] += 1
  }

  result = chunk(result, 3)
  const sum = result.reduce((pv, [, , m]) => pv + m, 0)
  result = result.map(([x, y, m]) => {
    return [
      (x / (abs(x) + abs(y))) * (m / sum) || 0,
      (y / (abs(x) + abs(y))) * (m / sum) || 0,
    ]
  })

  return chunk(result, 3)
    .map((row) => row.map(([x, y]) => printf(x) + '/' + printf(y)).join(' '))
    .join('\n')
}

function mapThetaToKernel2(bisector) {
  const result = [
    [PI * (7 / 6), PI * (8 / 6)],
    [PI * (8 / 6), PI * (10 / 6)],
    [PI * (10 / 6), PI * (11 / 6)],
    [PI * (5 / 6), PI * (7 / 6)],
    [PI * (0 / 6), PI * (0 / 6)],
    [PI * (11 / 6), PI * (13 / 6)],
    [PI * (4 / 6), PI * (5 / 6)],
    [PI * (2 / 6), PI * (4 / 6)],
    [PI * (1 / 6), PI * (2 / 6)],
  ].map(([loBound, hiBound], i) => {
    let xe0 = 5
    let ye0 = 0

    let arcFull = PI * 0.5
    let bisector = atan2(ye0, xe0)

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
      ((abs(xe0) + abs(ye0)) * (arc / (arcFull * 2))) /
      (abs(cos(theta)) + abs(sin(theta)))

    let xe1 = scalar * cos(theta)
    let ye1 = scalar * sin(theta)

    return (xe1.toFixed(2) + ',' + ye1.toFixed(2)).padStart(11)
  })

  return chunk(result, 3)
    .map((row) => row.join(' '))
    .join('\n')
}

export default function mapThetaToKernel() {
  const b = PI
  return mapThetaToKernel2(b)
}
