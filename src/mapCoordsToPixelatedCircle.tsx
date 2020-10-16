function tree(circlePart, reverseIndex) {
  if (circlePart.length === 1) {
    const [x, y] = circlePart[0]
    const ri = reverseIndex
    // prettier-ignore
    return `
      x >= 0. ?
        y >= 0. ?
          abs(y) >= abs(x) ? ${ri[`${x},${y}`]} : ${ri[`${y},${x}`]} :
          abs(y) >= abs(x) ? ${ri[`${x},${-y}`]} : ${ri[`${y},${-x}`]} :
        y >= 0. ?
          abs(y) >= abs(x) ? ${ri[`${-x},${y}`]} : ${ri[`${-y},${x}`]} :
          abs(y) >= abs(x) ? ${ri[`${-x},${-y}`]} : ${ri[`${-y},${-x}`]}
    `
  }

  const midIndex = Math.floor(circlePart.length / 2)
  const r0 = circlePart[midIndex - 1][0] / circlePart[midIndex - 1][1]
  const r1 = circlePart[midIndex][0] / circlePart[midIndex][1]

  const left = tree(circlePart.slice(0, midIndex), reverseIndex)
  const right = tree(circlePart.slice(midIndex), reverseIndex)
  return `
    r < ${(r0 + r1) / 2} ?
      ${left} :
      ${right}
  `.trim()
}

function removeDuplicates(a, f) {
  const hash = {}
  const next = []
  a.forEach((v) => {
    const k = f(v)
    if (!hash[k]) {
      hash[k] = true
      next.push(v)
    }
  })
  return next
}

function circleEighthToWhole(circleEighth) {
  return removeDuplicates(
    [].concat(
      circleEighth.map(([x, y]) => [x, y]),
      circleEighth.map(([x, y]) => [y, x]).reverse(),
      circleEighth.map(([x, y]) => [y, -x]),
      circleEighth.map(([x, y]) => [x, -y]).reverse(),
      circleEighth.map(([x, y]) => [-x, -y]),
      circleEighth.map(([x, y]) => [-y, -x]).reverse(),
      circleEighth.map(([x, y]) => [-y, x]),
      circleEighth.map(([x, y]) => [-x, y]).reverse()
    ),
    ([x, y]) => `${x || 0},${y || 0}`
  )
}

export default function createCoordsToPixelatedCircleMapper(circleEighth) {
  const reverseIndex = {}
  const circleWhole = circleEighthToWhole(circleEighth)
  circleWhole.forEach(([x, y], i) => {
    reverseIndex[`${x},${y}`] = i
  })
  const circleWholeFlat = []
    .concat(...circleWhole)
    .map((v) => v + '.')
    .join(', ')

  return (
    `float circle[${circleWhole.length * 2}] = float[](${circleWholeFlat});\n` +
    `int xy2i(in float x, in float y) {\n` +
    `  float r = abs(x) / abs(y);\n` +
    `  r = isinf(r) ? 0. : r >= 1. ? 1. / r : r;\n` +
    `  return ${tree(circleEighth, reverseIndex).replace(/\s+/g, ' ')};\n` +
    `}`
  )
}

console.log(
  createCoordsToPixelatedCircleMapper([
    [0, 3],
    [1, 3],
    [2, 2],
  ])
)
