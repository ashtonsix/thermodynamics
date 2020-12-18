const {PI, sin, cos, atan2, abs, random} = Math
const s = 10

const a = new Array(s).fill(null).map((_, i) => (i / s) * (PI * 2))

const c = a
  .map((_, i) => {
    const y = sin(a[i]) + sin(a[(i + 1) % s] + PI)
    const x = cos(a[i]) + cos(a[(i + 1) % s] + PI)
    return (x ** 2 + y ** 2) ** 0.5
  })
  .join('\n')

export default c
