/* eslint-disable no-lone-blocks */

type Texture = Vec4[][];
type Vec2 = [number, number];
type Vec4 = [number, number, number, number];
interface VecScalarOp {
  (a: number, b: number): number;
  (a: number, b: Vec2): Vec2;
  (a: number, b: Vec4): Vec4;
  (a: Vec2, b: number): Vec2;
  (a: Vec4, b: number): Vec4;
  (a: Vec2, b: Vec2): Vec2;
  (a: Vec4, b: Vec4): Vec4;
}

const {PI, sin, cos, atan2: atan, min, max, floor, round, abs, pow} = Math;
const PI2 = PI * 2.0;
const isinf = (x: number) => !isFinite(x);
const isnan = (x: number) => isNaN(x);
const vec2 = (x: number, y: number): Vec2 => [x, y];
const vec4 = (x: number, y: number, z: number, w: number): Vec4 => [x, y, z, w];
(window as any).counter = 0;
const vecMap = (a, b, f) => {
  (window as any).counter += 1;
  if (!a.length && !b.length) return f(a, b);
  if (a.length && !b.length) return a.map((a) => f(a, b));
  if (!a.length && b.length) return b.map((b) => f(a, b));
  if (a.length !== b.length) throw Error('dumb');
  return a.map((_, i) => f(a[i], b[i]));
};
const add: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a + b);
const sub: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a - b);
const mul: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a * b);
const div: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a / b);
// prettier-ignore
const mod: VecScalarOp = (x, m) => vecMap(x, m, (x, m) => (x < 0 ? NaN : x % m));
function fill(a: number, b: number): number;
function fill(a: Vec2, b: number): Vec2;
function fill(a: Vec4, b: number): Vec4;
function fill(a: Vec2, b: Vec2): Vec2;
function fill(a: Vec4, b: Vec4): Vec4;
function fill(a: any, b: any): any {
  if (typeof a === 'number') return isnan(a) || isinf(a) ? b : a;
  if (typeof b === 'number') {
    return a.map((a, i) => (isnan(a) || isinf(a) ? b : a));
  }
  return a.map((_, i) => (isnan(a[i]) || isinf(a[i]) ? b[i] : a[i]));
}
function dot(a: number, b: number): number;
function dot(a: Vec2, b: Vec2): number;
function dot(a: Vec4, b: Vec4): number;
function dot(a: any, b: any): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * b;
  }
  return a.map((_, i) => a[i] * b[i]).reduce((pv, v) => pv + v, 0);
}
const sumVec = vec4(1.0, 1.0, 1.0, 1.0);
function sum(x: number): number;
function sum(x: Vec2): number;
function sum(x: Vec4): number;
function sum(x: any): number {
  return dot(x, sumVec);
}
function mix(a: number, b: number, m: number): number;
function mix(a: Vec2, b: Vec2, m: number): Vec2;
function mix(a: Vec4, b: Vec4, m: number): Vec4;
function mix(a: Vec4, b: Vec4, m: Vec2): Vec4;
function mix(a: Vec4, b: Vec4, m: Vec4): Vec4;
function mix(a: any, b: any, m: any): any {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * m + b * (1 - m);
  }
  if (typeof m === 'number') {
    return a.map((_, i) => a[i] * m + b[i] * (1 - m));
  }
  return a.map((_, i) => a[i] * m[i] + b[i] * (1 - m[i]));
}
function len(x: number | Vec2 | Vec4): number {
  if (typeof x === 'number') return x;
  return x.map((x) => x ** 2.0).reduce((pv, v) => pv + v, 0.0) ** 0.5;
}
function normalize(x: number): number;
function normalize(x: Vec2): Vec2;
function normalize(x: Vec4): Vec4;
function normalize(x: any): any {
  return len(x) ? div(x, len(x)) : vec2(0, 0);
}
function texture(tex: Texture, vUV: Vec2): Vec4 {
  const mod2 = (x, m) => ((x % m) + m) % m;
  const row = tex[mod2(floor(vUV[1] * tex.length + 0.0001), tex.length)];
  const cel = row[mod2(floor(vUV[0] * tex.length + 0.0001), tex.length)];
  return cel;
}

function getNextBound(bound: Vec4): Vec4 {
  let ix = bound[0]; // float
  let iy = bound[1]; // float
  let it = bound[2]; // float
  let radius = bound[3]; // float
  let ox = 0.0; // float
  let oy = 0.0; // float
  let ot = 7.0; // float
  if (it < PI && abs(ix - 0.5) < radius) {
    let x = ix - 0.5; // float
    let y = pow(pow(radius, 2.0) - pow(x, 2.0), 0.5); // float
    let t = atan(y, x); // float
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix - 1.0;
      oy = iy;
      ot = t;
    }
  }
  if ((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) {
    let y = iy + 0.5; // float
    let x = pow(pow(radius, 2.0) - pow(y, 2.0), 0.5); // float
    let t = atan(y, x); // float
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.0;
      ot = t;
    }
  }
  if (it >= PI && abs(ix + 0.5) < radius) {
    let x = ix + 0.5; // float
    let y = -pow(pow(radius, 2.0) - pow(x, 2.0), 0.5); // float
    let t = atan(y, x); // float
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix + 1.0;
      oy = iy;
      ot = t;
    }
  }
  if (it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) {
    let y = iy - 0.5; // float
    let x = -pow(pow(radius, 2.0) - pow(y, 2.0), 0.5); // float
    let t = atan(y, x); // float
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy - 1.0;
      ot = t;
    }
  }
  return vec4(ox, oy, ot, radius);
}

function arcOverlap(loCel: number, hiCel: number, loArc: number, hiArc: number) {
  let length = 0.0; // float
  let theta = 0.0; // float
  // prettier-ignore
  if ((hiCel - loCel) + (hiArc - loArc) >= PI2) {
    length = ((hiCel - loCel) + (hiArc - loArc)) - PI2;
    theta = mod((loArc + hiArc) / 2.0 + PI, PI2);
  } else {
    if (hiArc < loCel) {
      loArc += PI2;
      hiArc += PI2;
    } else if (hiCel < loArc) {
      loCel += PI2;
      hiCel += PI2;
    }
    let lo = max(min(loArc, hiCel), loCel); // float
    let hi = max(min(hiArc, hiCel), loCel); // float
  
    length = (hi - lo) / (hiArc - loArc);
    theta = mod((lo + hi) / 2.0, PI2);
  }

  return vec2(cos(theta) * length, sin(theta) * length);
}

function copyPaste(vUV: Vec2, uniforms, textures: Texture[]) {
  return [texture(textures[0], vUV)];
}
function compactLength(vUV: Vec2, uniforms, textures: Texture[]) {
  const [substance01Tex, substance23Tex] = textures;
  let c01 = texture(substance01Tex, vUV); // vec4
  let c23 = texture(substance23Tex, vUV); // vec4
  let s0 = vec2(c01[0], c01[1]); // vec2
  let s1 = vec2(c01[2], c01[3]); // vec2
  let s2 = vec2(c23[0], c23[1]); // vec2
  let s3 = vec2(c23[2], c23[3]); // vec2

  return [vec4(len(s0), len(s1), len(s2), len(s3))];
}
function transferPrepare(vUV: Vec2, uniforms, textures: Texture[]) {
  // a=giving, b=recieving
  const [
    substance01aTex,
    substance23aTex,
    substance45aTex,
    substance67aTex,
    substance0123bTex,
    substance4567bTex,
  ] = textures;
  const [uSize, uTransferRadius] = uniforms.static;
  // prettier-ignore
  const [
    uArc0123, uArcWeight0123, uArcBlending0123,
    uFlo0123, uFloWeight0123, uFloBlending0123,
              uDirWeight0123, uDirBlending0123,
    uArc4567, uArcWeight4567, uArcBlending4567,
    uFlo4567, uFloWeight4567, uFloBlending4567,
              uDirWeight4567, uDirBlending4567,
  ] = uniforms.substance;
  // prettier-ignore
  const [
    am0x0123, am1x0123, am2x0123, am3x0123,
    am4x0123, am5x0123, am6x0123, am7x0123,
    am0x4567, am1x4567, am2x4567, am3x4567,
    am4x4567, am5x4567, am6x4567, am7x4567,
  ] = uniforms.substanceAttractionMatrix;
  let c01a = texture(substance01aTex, vUV); // vec4
  let c23a = texture(substance23aTex, vUV); // vec4
  let c45a = texture(substance45aTex, vUV); // vec4
  let c67a = texture(substance67aTex, vUV); // vec4
  let s0a = vec2(c01a[0], c01a[1]); // vec2
  let s1a = vec2(c01a[2], c01a[3]); // vec2
  let s2a = vec2(c23a[0], c23a[1]); // vec2
  let s3a = vec2(c23a[2], c23a[3]); // vec2
  let s4a = vec2(c45a[0], c45a[1]); // vec2
  let s5a = vec2(c45a[2], c45a[3]); // vec2
  let s6a = vec2(c67a[0], c67a[1]); // vec2
  let s7a = vec2(c67a[2], c67a[3]); // vec2
  let s0aLen = len(s0a); // float
  let s1aLen = len(s1a); // float
  let s2aLen = len(s2a); // float
  let s3aLen = len(s3a); // float
  let s4aLen = len(s4a); // float
  let s5aLen = len(s5a); // float
  let s6aLen = len(s6a); // float
  let s7aLen = len(s7a); // float
  let s0123aLen = vec4(s0aLen, s1aLen, s2aLen, s3aLen); // vec4
  let s4567aLen = vec4(s4aLen, s5aLen, s6aLen, s7aLen); // vec4
  let s0123aX = vec4(s0a[0], s1a[0], s2a[0], s3a[0]); // vec4
  let s4567aX = vec4(s4a[0], s5a[0], s6a[0], s7a[0]); // vec4
  let s0123aY = vec4(s0a[1], s1a[1], s2a[1], s3a[1]); // vec4
  let s4567aY = vec4(s4a[1], s5a[1], s6a[1], s7a[1]); // vec4

  let avgArc = // float
    (dot(uArc0123, mul(s0123aLen, uArcWeight0123)) + dot(uArc4567, mul(s4567aLen, uArcWeight4567))) /
    (dot(s0123aLen, uArcWeight0123) + dot(s4567aLen, uArcWeight4567));
  let avgFlo = // float
    (dot(uFlo0123, mul(s0123aLen, uFloWeight0123)) + dot(uFlo4567, mul(s4567aLen, uFloWeight4567))) /
    (dot(s0123aLen, uFloWeight0123) + dot(s4567aLen, uFloWeight4567));
  avgArc = fill(avgArc, -1.0);
  avgFlo = fill(avgFlo, -1.0);
  // prettier-ignore
  let avgDir = normalize( // vec2
    vec2(
      dot(s0123aX, uDirWeight0123) + dot(s4567aX, uDirWeight4567),
      dot(s0123aY, uDirWeight0123) + dot(s4567aY, uDirWeight4567)
    )
  );

  let s0123aArc = avgArc === -1.0 ? uArc0123 : mix(uArc0123, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending0123); // vec4
  let s4567aArc = avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567); // vec4
  let s0123aFlo = avgFlo === -1.0 ? uFlo0123 : mix(uFlo0123, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending0123); // vec4
  let s4567aFlo = avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567); // vec4
  s0123aFlo = mul(s0123aFlo, s0123aLen);
  s4567aFlo = mul(s4567aFlo, s4567aLen);
  s0a = mul(normalize(mix(normalize(s0a), avgDir, uDirBlending0123[0])), s0aLen);
  s1a = mul(normalize(mix(normalize(s1a), avgDir, uDirBlending0123[1])), s1aLen);
  s2a = mul(normalize(mix(normalize(s2a), avgDir, uDirBlending0123[2])), s2aLen);
  s3a = mul(normalize(mix(normalize(s3a), avgDir, uDirBlending0123[3])), s3aLen);
  s4a = mul(normalize(mix(normalize(s4a), avgDir, uDirBlending4567[0])), s4aLen);
  s5a = mul(normalize(mix(normalize(s5a), avgDir, uDirBlending4567[1])), s5aLen);
  s6a = mul(normalize(mix(normalize(s6a), avgDir, uDirBlending4567[2])), s6aLen);
  s7a = mul(normalize(mix(normalize(s7a), avgDir, uDirBlending4567[3])), s7aLen);

  let s0123Bisector = vec4(atan(s0a[1], s0a[0]), atan(s1a[1], s1a[0]), atan(s2a[1], s2a[0]), atan(s3a[1], s3a[0])); // vec4
  let s4567Bisector = vec4(atan(s4a[1], s4a[0]), atan(s5a[1], s5a[0]), atan(s6a[1], s6a[0]), atan(s7a[1], s7a[0])); // vec4
  let s0123aLoBound = mod(add(sub(s0123Bisector, s0123aArc), PI2), PI2); // vec4
  let s4567aLoBound = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2); // vec4
  let s0123aHiBound = mod(add(add(s0123Bisector, s0123aArc), PI2), PI2); // vec4
  let s4567aHiBound = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2); // vec4

  s0123aHiBound = vec4(
    s0123aLoBound[0] > s0123aHiBound[0] ? s0123aHiBound[0] + PI2 : s0123aHiBound[0],
    s0123aLoBound[1] > s0123aHiBound[1] ? s0123aHiBound[1] + PI2 : s0123aHiBound[1],
    s0123aLoBound[2] > s0123aHiBound[2] ? s0123aHiBound[2] + PI2 : s0123aHiBound[2],
    s0123aLoBound[3] > s0123aHiBound[3] ? s0123aHiBound[3] + PI2 : s0123aHiBound[3]
  );
  s4567aHiBound = vec4(
    s4567aLoBound[0] > s4567aHiBound[0] ? s4567aHiBound[0] + PI2 : s4567aHiBound[0],
    s4567aLoBound[1] > s4567aHiBound[1] ? s4567aHiBound[1] + PI2 : s4567aHiBound[1],
    s4567aLoBound[2] > s4567aHiBound[2] ? s4567aHiBound[2] + PI2 : s4567aHiBound[2],
    s4567aLoBound[3] > s4567aHiBound[3] ? s4567aHiBound[3] + PI2 : s4567aHiBound[3]
  );

  let s0TransferFractionSum = 0.0; // float
  let s1TransferFractionSum = 0.0; // float
  let s2TransferFractionSum = 0.0; // float
  let s3TransferFractionSum = 0.0; // float
  let s4TransferFractionSum = 0.0; // float
  let s5TransferFractionSum = 0.0; // float
  let s6TransferFractionSum = 0.0; // float
  let s7TransferFractionSum = 0.0; // float
  let s0GivenDir = vec2(0.0, 0.0); // vec2
  let s1GivenDir = vec2(0.0, 0.0); // vec2
  let s2GivenDir = vec2(0.0, 0.0); // vec2
  let s3GivenDir = vec2(0.0, 0.0); // vec2
  let s4GivenDir = vec2(0.0, 0.0); // vec2
  let s5GivenDir = vec2(0.0, 0.0); // vec2
  let s6GivenDir = vec2(0.0, 0.0); // vec2
  let s7GivenDir = vec2(0.0, 0.0); // vec2

  let prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius); // vec4
  let nextBound = getNextBound(prevBound); // vec4
  for (let i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound = prevBound[2]; // float
    let hiBound = nextBound[2]; // float
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV = vec2(vUV[0] + prevBound[0] / uSize, vUV[1] + prevBound[1] / uSize); // vec2
    let s0123bLen = texture(substance0123bTex, vvUV); // vec4
    let s4567bLen = texture(substance4567bTex, vvUV); // vec4

    let s0Attraction = dot(s0123bLen, am0x0123) + dot(s4567bLen, am0x4567); // float
    let s1Attraction = dot(s0123bLen, am1x0123) + dot(s4567bLen, am1x4567); // float
    let s2Attraction = dot(s0123bLen, am2x0123) + dot(s4567bLen, am2x4567); // float
    let s3Attraction = dot(s0123bLen, am3x0123) + dot(s4567bLen, am3x4567); // float
    let s4Attraction = dot(s0123bLen, am4x0123) + dot(s4567bLen, am4x4567); // float
    let s5Attraction = dot(s0123bLen, am5x0123) + dot(s4567bLen, am5x4567); // float
    let s6Attraction = dot(s0123bLen, am6x0123) + dot(s4567bLen, am6x4567); // float
    let s7Attraction = dot(s0123bLen, am7x0123) + dot(s4567bLen, am7x4567); // float
    let sAttractionSum = // float
      sum(vec4(s0Attraction, s1Attraction, s2Attraction, s3Attraction)) +
      sum(vec4(s4Attraction, s5Attraction, s6Attraction, s7Attraction));
    s0Attraction = sAttractionSum === 0.0 ? 1.0 : s0Attraction / sAttractionSum;
    s1Attraction = sAttractionSum === 0.0 ? 1.0 : s1Attraction / sAttractionSum;
    s2Attraction = sAttractionSum === 0.0 ? 1.0 : s2Attraction / sAttractionSum;
    s3Attraction = sAttractionSum === 0.0 ? 1.0 : s3Attraction / sAttractionSum;
    s4Attraction = sAttractionSum === 0.0 ? 1.0 : s4Attraction / sAttractionSum;
    s5Attraction = sAttractionSum === 0.0 ? 1.0 : s5Attraction / sAttractionSum;
    s6Attraction = sAttractionSum === 0.0 ? 1.0 : s6Attraction / sAttractionSum;
    s7Attraction = sAttractionSum === 0.0 ? 1.0 : s7Attraction / sAttractionSum;

    let s0TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[0], s0123aHiBound[0]), s0Attraction); // vec2
    let s1TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[1], s0123aHiBound[1]), s1Attraction); // vec2
    let s2TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[2], s0123aHiBound[2]), s2Attraction); // vec2
    let s3TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[3], s0123aHiBound[3]), s3Attraction); // vec2
    let s4TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction); // vec2
    let s5TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction); // vec2
    let s6TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction); // vec2
    let s7TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction); // vec2

    s0TransferFractionSum += len(s0TransferFraction);
    s1TransferFractionSum += len(s1TransferFraction);
    s2TransferFractionSum += len(s2TransferFraction);
    s3TransferFractionSum += len(s3TransferFraction);
    s4TransferFractionSum += len(s4TransferFraction);
    s5TransferFractionSum += len(s5TransferFraction);
    s6TransferFractionSum += len(s6TransferFraction);
    s7TransferFractionSum += len(s7TransferFraction);

    s0GivenDir = add(s0GivenDir, s0TransferFraction);
    s1GivenDir = add(s1GivenDir, s1TransferFraction);
    s2GivenDir = add(s2GivenDir, s2TransferFraction);
    s3GivenDir = add(s3GivenDir, s3TransferFraction);
    s4GivenDir = add(s4GivenDir, s4TransferFraction);
    s5GivenDir = add(s5GivenDir, s5TransferFraction);
    s6GivenDir = add(s6GivenDir, s6TransferFraction);
    s7GivenDir = add(s7GivenDir, s7TransferFraction);

    if (hiBound > PI2) {
      break;
    }
  }

  // flowWeightedTransferFractionSum
  let s0FWTFS = mul(normalize(s0a), fill(div(s0TransferFractionSum, s0123aFlo[0]), 0.0)); // vec2
  let s1FWTFS = mul(normalize(s1a), fill(div(s1TransferFractionSum, s0123aFlo[1]), 0.0)); // vec2
  let s2FWTFS = mul(normalize(s2a), fill(div(s2TransferFractionSum, s0123aFlo[2]), 0.0)); // vec2
  let s3FWTFS = mul(normalize(s3a), fill(div(s3TransferFractionSum, s0123aFlo[3]), 0.0)); // vec2
  let s4FWTFS = mul(normalize(s4a), fill(div(s4TransferFractionSum, s4567aFlo[0]), 0.0)); // vec2
  let s5FWTFS = mul(normalize(s5a), fill(div(s5TransferFractionSum, s4567aFlo[1]), 0.0)); // vec2
  let s6FWTFS = mul(normalize(s6a), fill(div(s6TransferFractionSum, s4567aFlo[2]), 0.0)); // vec2
  let s7FWTFS = mul(normalize(s7a), fill(div(s7TransferFractionSum, s4567aFlo[3]), 0.0)); // vec2

  let s01FWTFS = vec4(s0FWTFS[0], s0FWTFS[1], s1FWTFS[0], s1FWTFS[1]); // vec4
  let s23FWTFS = vec4(s2FWTFS[0], s2FWTFS[1], s3FWTFS[0], s3FWTFS[1]); // vec4
  let s45FWTFS = vec4(s4FWTFS[0], s4FWTFS[1], s5FWTFS[0], s5FWTFS[1]); // vec4
  let s67FWTFS = vec4(s6FWTFS[0], s6FWTFS[1], s7FWTFS[0], s7FWTFS[1]); // vec4

  let s0Given = mul(normalize(s0GivenDir), s0123aFlo[0]); // vec2
  let s1Given = mul(normalize(s1GivenDir), s0123aFlo[1]); // vec2
  let s2Given = mul(normalize(s2GivenDir), s0123aFlo[2]); // vec2
  let s3Given = mul(normalize(s3GivenDir), s0123aFlo[3]); // vec2
  let s4Given = mul(normalize(s4GivenDir), s4567aFlo[0]); // vec2
  let s5Given = mul(normalize(s5GivenDir), s4567aFlo[1]); // vec2
  let s6Given = mul(normalize(s6GivenDir), s4567aFlo[2]); // vec2
  let s7Given = mul(normalize(s7GivenDir), s4567aFlo[3]); // vec2

  let s01Given = vec4(s0Given[0], s0Given[1], s1Given[0], s1Given[1]); // vec4
  let s23Given = vec4(s2Given[0], s2Given[1], s3Given[0], s3Given[1]); // vec4
  let s45Given = vec4(s4Given[0], s4Given[1], s5Given[0], s5Given[1]); // vec4
  let s67Given = vec4(s6Given[0], s6Given[1], s7Given[0], s7Given[1]); // vec4

  // prettier-ignore
  return [
    s01FWTFS, s23FWTFS, s45FWTFS, s67FWTFS,
    s01Given, s23Given, s45Given, s67Given,
    vec4(avgArc, avgFlo, 0.0, 0.0)
  ];
}

function transferRun(vUV: Vec2, uniforms, textures: Texture[]) {
  const [
    substance01bTex,
    substance23bTex,
    substance45bTex,
    substance67bTex,
    substance01aTex,
    substance23aTex,
    substance45aTex,
    substance67aTex,
    substance01GivenTex,
    substance23GivenTex,
    substance45GivenTex,
    substance67GivenTex,
    avgArcAndFloTex,
  ] = textures;
  const [uSize, uTransferRadius] = uniforms.static;
  // prettier-ignore
  const [
    uArc0123, /* uArcWeight0123 */, uArcBlending0123,
    uFlo0123, /* uFloWeight0123 */, uFloBlending0123,
              /* uDirWeight0123 */, /* uDirBlending0123 */,
    uArc4567, /* uArcWeight4567 */, uArcBlending4567,
    uFlo4567, /* uFloWeight4567 */, uFloBlending4567,
              /* uDirWeight4567 */, /* uDirBlending4567 */,
  ] = uniforms.substance;
  // prettier-ignore
  const [
    am0x0123, am1x0123, am2x0123, am3x0123,
    am4x0123, am5x0123, am6x0123, am7x0123,
    am0x4567, am1x4567, am2x4567, am3x4567,
    am4x4567, am5x4567, am6x4567, am7x4567,
  ] = uniforms.substanceAttractionMatrix;
  let c01b = texture(substance01bTex, vUV); // vec4
  let c23b = texture(substance23bTex, vUV); // vec4
  let c45b = texture(substance45bTex, vUV); // vec4
  let c67b = texture(substance67bTex, vUV); // vec4
  let s0b = vec2(c01b[0], c01b[1]); // vec2
  let s1b = vec2(c01b[2], c01b[3]); // vec2
  let s2b = vec2(c23b[0], c23b[1]); // vec2
  let s3b = vec2(c23b[2], c23b[3]); // vec2
  let s4b = vec2(c45b[0], c45b[1]); // vec2
  let s5b = vec2(c45b[2], c45b[3]); // vec2
  let s6b = vec2(c67b[0], c67b[1]); // vec2
  let s7b = vec2(c67b[2], c67b[3]); // vec2
  let s0bLen = len(s0b); // vec2
  let s1bLen = len(s1b); // vec2
  let s2bLen = len(s2b); // vec2
  let s3bLen = len(s3b); // vec2
  let s4bLen = len(s4b); // vec2
  let s5bLen = len(s5b); // vec2
  let s6bLen = len(s6b); // vec2
  let s7bLen = len(s7b); // vec2
  let s0123bLen = vec4(s0bLen, s1bLen, s2bLen, s3bLen); // vec4
  let s4567bLen = vec4(s4bLen, s5bLen, s6bLen, s7bLen); // vec4

  let s0Attraction = dot(s0123bLen, am0x0123) + dot(s4567bLen, am0x4567); // float
  let s1Attraction = dot(s0123bLen, am1x0123) + dot(s4567bLen, am1x4567); // float
  let s2Attraction = dot(s0123bLen, am2x0123) + dot(s4567bLen, am2x4567); // float
  let s3Attraction = dot(s0123bLen, am3x0123) + dot(s4567bLen, am3x4567); // float
  let s4Attraction = dot(s0123bLen, am4x0123) + dot(s4567bLen, am4x4567); // float
  let s5Attraction = dot(s0123bLen, am5x0123) + dot(s4567bLen, am5x4567); // float
  let s6Attraction = dot(s0123bLen, am6x0123) + dot(s4567bLen, am6x4567); // float
  let s7Attraction = dot(s0123bLen, am7x0123) + dot(s4567bLen, am7x4567); // float
  let sAttractionSum = // float
    sum(vec4(s0Attraction, s1Attraction, s2Attraction, s3Attraction)) +
    sum(vec4(s4Attraction, s5Attraction, s6Attraction, s7Attraction));
  s0Attraction = sAttractionSum === 0.0 ? 1.0 : s0Attraction / sAttractionSum;
  s1Attraction = sAttractionSum === 0.0 ? 1.0 : s1Attraction / sAttractionSum;
  s2Attraction = sAttractionSum === 0.0 ? 1.0 : s2Attraction / sAttractionSum;
  s3Attraction = sAttractionSum === 0.0 ? 1.0 : s3Attraction / sAttractionSum;
  s4Attraction = sAttractionSum === 0.0 ? 1.0 : s4Attraction / sAttractionSum;
  s5Attraction = sAttractionSum === 0.0 ? 1.0 : s5Attraction / sAttractionSum;
  s6Attraction = sAttractionSum === 0.0 ? 1.0 : s6Attraction / sAttractionSum;
  s7Attraction = sAttractionSum === 0.0 ? 1.0 : s7Attraction / sAttractionSum;

  let s0FloLen = 0.0; // float
  let s1FloLen = 0.0; // float
  let s2FloLen = 0.0; // float
  let s3FloLen = 0.0; // float
  let s4FloLen = 0.0; // float
  let s5FloLen = 0.0; // float
  let s6FloLen = 0.0; // float
  let s7FloLen = 0.0; // float
  let s0FloDir = vec2(0.0, 0.0); // vec2
  let s1FloDir = vec2(0.0, 0.0); // vec2
  let s2FloDir = vec2(0.0, 0.0); // vec2
  let s3FloDir = vec2(0.0, 0.0); // vec2
  let s4FloDir = vec2(0.0, 0.0); // vec2
  let s5FloDir = vec2(0.0, 0.0); // vec2
  let s6FloDir = vec2(0.0, 0.0); // vec2
  let s7FloDir = vec2(0.0, 0.0); // vec2

  let prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius); // vec4
  let nextBound = getNextBound(prevBound); // vec4
  for (let i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound = prevBound[2]; // vec4
    let hiBound = nextBound[2]; // vec4
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV = vec2(vUV[0] - prevBound[0] / uSize, vUV[1] - prevBound[1] / uSize); // vec2
    let c01a = texture(substance01aTex, vvUV); // vec4
    let c23a = texture(substance23aTex, vvUV); // vec4
    let c45a = texture(substance45aTex, vvUV); // vec4
    let c67a = texture(substance67aTex, vvUV); // vec4
    let s0aFWTFS = vec2(c01a[0], c01a[1]); // vec2
    let s1aFWTFS = vec2(c01a[2], c01a[3]); // vec2
    let s2aFWTFS = vec2(c23a[0], c23a[1]); // vec2
    let s3aFWTFS = vec2(c23a[2], c23a[3]); // vec2
    let s4aFWTFS = vec2(c45a[0], c45a[1]); // vec2
    let s5aFWTFS = vec2(c45a[2], c45a[3]); // vec2
    let s6aFWTFS = vec2(c67a[0], c67a[1]); // vec2
    let s7aFWTFS = vec2(c67a[2], c67a[3]); // vec2

    // prettier-ignore
    let s0123Bisector = vec4( // vec4
      atan(s0aFWTFS[1], s0aFWTFS[0]), atan(s1aFWTFS[1], s1aFWTFS[0]),
      atan(s2aFWTFS[1], s2aFWTFS[0]), atan(s3aFWTFS[1], s3aFWTFS[0])
    );
    // prettier-ignore
    let s4567Bisector = vec4( // vec4
      atan(s4aFWTFS[1], s4aFWTFS[0]), atan(s5aFWTFS[1], s5aFWTFS[0]),
      atan(s6aFWTFS[1], s6aFWTFS[0]), atan(s7aFWTFS[1], s7aFWTFS[0])
    );
    let avgArc = texture(avgArcAndFloTex, vvUV)[0]; // float
    let s0123aArc = avgArc === -1.0 ? uArc0123 : mix(uArc0123, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending0123); // vec4
    let s4567aArc = avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567); // vec4

    let s0123aLoBound = mod(add(sub(s0123Bisector, s0123aArc), PI2), PI2); // vec4
    let s4567aLoBound = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2); // vec4
    let s0123aHiBound = mod(add(add(s0123Bisector, s0123aArc), PI2), PI2); // vec4
    let s4567aHiBound = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2); // vec4
    s0123aHiBound = vec4(
      s0123aLoBound[0] > s0123aHiBound[0] ? s0123aHiBound[0] + PI2 : s0123aHiBound[0],
      s0123aLoBound[1] > s0123aHiBound[1] ? s0123aHiBound[1] + PI2 : s0123aHiBound[1],
      s0123aLoBound[2] > s0123aHiBound[2] ? s0123aHiBound[2] + PI2 : s0123aHiBound[2],
      s0123aLoBound[3] > s0123aHiBound[3] ? s0123aHiBound[3] + PI2 : s0123aHiBound[3]
    );
    s4567aHiBound = vec4(
      s4567aLoBound[0] > s4567aHiBound[0] ? s4567aHiBound[0] + PI2 : s4567aHiBound[0],
      s4567aLoBound[1] > s4567aHiBound[1] ? s4567aHiBound[1] + PI2 : s4567aHiBound[1],
      s4567aLoBound[2] > s4567aHiBound[2] ? s4567aHiBound[2] + PI2 : s4567aHiBound[2],
      s4567aLoBound[3] > s4567aHiBound[3] ? s4567aHiBound[3] + PI2 : s4567aHiBound[3]
    );

    let s0TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[0], s0123aHiBound[0]), s0Attraction); // vec2
    let s1TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[1], s0123aHiBound[1]), s1Attraction); // vec2
    let s2TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[2], s0123aHiBound[2]), s2Attraction); // vec2
    let s3TransferFraction = mul(arcOverlap(loBound, hiBound, s0123aLoBound[3], s0123aHiBound[3]), s3Attraction); // vec2
    let s4TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction); // vec2
    let s5TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction); // vec2
    let s6TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction); // vec2
    let s7TransferFraction = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction); // vec2

    let s0FloFraction = fill(div(s0TransferFraction, len(s0aFWTFS)), 0.0); // vec2
    let s1FloFraction = fill(div(s1TransferFraction, len(s1aFWTFS)), 0.0); // vec2
    let s2FloFraction = fill(div(s2TransferFraction, len(s2aFWTFS)), 0.0); // vec2
    let s3FloFraction = fill(div(s3TransferFraction, len(s3aFWTFS)), 0.0); // vec2
    let s4FloFraction = fill(div(s4TransferFraction, len(s4aFWTFS)), 0.0); // vec2
    let s5FloFraction = fill(div(s5TransferFraction, len(s5aFWTFS)), 0.0); // vec2
    let s6FloFraction = fill(div(s6TransferFraction, len(s6aFWTFS)), 0.0); // vec2
    let s7FloFraction = fill(div(s7TransferFraction, len(s7aFWTFS)), 0.0); // vec2

    s0FloDir = add(s0FloDir, s0FloFraction);
    s1FloDir = add(s1FloDir, s1FloFraction);
    s2FloDir = add(s2FloDir, s2FloFraction);
    s3FloDir = add(s3FloDir, s3FloFraction);
    s4FloDir = add(s4FloDir, s4FloFraction);
    s5FloDir = add(s5FloDir, s5FloFraction);
    s6FloDir = add(s6FloDir, s6FloFraction);
    s7FloDir = add(s7FloDir, s7FloFraction);

    s0FloLen = add(s0FloLen, len(s0FloFraction));
    s1FloLen = add(s1FloLen, len(s1FloFraction));
    s2FloLen = add(s2FloLen, len(s2FloFraction));
    s3FloLen = add(s3FloLen, len(s3FloFraction));
    s4FloLen = add(s4FloLen, len(s4FloFraction));
    s5FloLen = add(s5FloLen, len(s5FloFraction));
    s6FloLen = add(s6FloLen, len(s6FloFraction));
    s7FloLen = add(s7FloLen, len(s7FloFraction));

    if (hiBound > PI2) {
      break;
    }
  }

  let c01Given = texture(substance01GivenTex, vUV); // vec4
  let c23Given = texture(substance23GivenTex, vUV); // vec4
  let c45Given = texture(substance45GivenTex, vUV); // vec4
  let c67Given = texture(substance67GivenTex, vUV); // vec4
  let s0Given = vec2(c01Given[0], c01Given[1]); // vec2
  let s1Given = vec2(c01Given[2], c01Given[3]); // vec2
  let s2Given = vec2(c23Given[0], c23Given[1]); // vec2
  let s3Given = vec2(c23Given[2], c23Given[3]); // vec2
  let s4Given = vec2(c45Given[0], c45Given[1]); // vec2
  let s5Given = vec2(c45Given[2], c45Given[3]); // vec2
  let s6Given = vec2(c67Given[0], c67Given[1]); // vec2
  let s7Given = vec2(c67Given[2], c67Given[3]); // vec2

  let s0Received = mul(normalize(s0FloDir), s0FloLen); // vec2
  let s1Received = mul(normalize(s1FloDir), s1FloLen); // vec2
  let s2Received = mul(normalize(s2FloDir), s2FloLen); // vec2
  let s3Received = mul(normalize(s3FloDir), s3FloLen); // vec2
  let s4Received = mul(normalize(s4FloDir), s4FloLen); // vec2
  let s5Received = mul(normalize(s5FloDir), s5FloLen); // vec2
  let s6Received = mul(normalize(s6FloDir), s6FloLen); // vec2
  let s7Received = mul(normalize(s7FloDir), s7FloLen); // vec2

  let avgFlo = texture(avgArcAndFloTex, vUV)[1]; // float // TODO: use -1 for fill
  let s0123bFlo = avgFlo === -1.0 ? uFlo0123 : mix(uFlo0123, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending0123); // vec4
  let s4567bFlo = avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567); // vec4

  let s0Remaining = mul(s0b, 1.0 - s0123bFlo[0]); // vec2
  let s1Remaining = mul(s1b, 1.0 - s0123bFlo[1]); // vec2
  let s2Remaining = mul(s2b, 1.0 - s0123bFlo[2]); // vec2
  let s3Remaining = mul(s3b, 1.0 - s0123bFlo[3]); // vec2
  let s4Remaining = mul(s4b, 1.0 - s4567bFlo[0]); // vec2
  let s5Remaining = mul(s5b, 1.0 - s4567bFlo[1]); // vec2
  let s6Remaining = mul(s6b, 1.0 - s4567bFlo[2]); // vec2
  let s7Remaining = mul(s7b, 1.0 - s4567bFlo[3]); // vec2

  let s0 = mul(normalize(add(add(s0Given, s0Received), s0Remaining)), len(s0Received) + len(s0Remaining)); // vec2
  let s1 = mul(normalize(add(add(s1Given, s1Received), s1Remaining)), len(s1Received) + len(s1Remaining)); // vec2
  let s2 = mul(normalize(add(add(s2Given, s2Received), s2Remaining)), len(s2Received) + len(s2Remaining)); // vec2
  let s3 = mul(normalize(add(add(s3Given, s3Received), s3Remaining)), len(s3Received) + len(s3Remaining)); // vec2
  let s4 = mul(normalize(add(add(s4Given, s4Received), s4Remaining)), len(s4Received) + len(s4Remaining)); // vec2
  let s5 = mul(normalize(add(add(s5Given, s5Received), s5Remaining)), len(s5Received) + len(s5Remaining)); // vec2
  let s6 = mul(normalize(add(add(s6Given, s6Received), s6Remaining)), len(s6Received) + len(s6Remaining)); // vec2
  let s7 = mul(normalize(add(add(s7Given, s7Received), s7Remaining)), len(s7Received) + len(s7Remaining)); // vec2

  let s01 = vec4(s0[0], s0[1], s1[0], s1[1]); // vec4
  let s23 = vec4(s2[0], s2[1], s3[0], s3[1]); // vec4
  let s45 = vec4(s4[0], s4[1], s5[0], s5[1]); // vec4
  let s67 = vec4(s6[0], s6[1], s7[0], s7[1]); // vec4

  return [s01, s23, s45, s67];
}
// function substanceReact(vUV: Vec2, uniforms, textures: Texture[]) {
//   const [substance01Tex, substance23Tex, substance45Tex, substance67Tex, address0123Tex, address4567Tex] = textures;
// }
// function addressPrepare(vUV: Vec2, uniforms, textures: Texture[]) {}
// function addressRun(vUV: Vec2, uniforms, textures: Texture[]) {}

class Sim {
  size = null;
  uniforms = null;
  textures = {};
  reduce(texture) {
    return this.textures[texture].reduce(
      (pv, v) =>
        add(
          pv,
          v.reduce((pv, v) => add(pv, v), [0, 0, 0, 0])
        ),
      [0, 0, 0, 0]
    );
  }
  compute(shader, texturesIn, texturesOut) {
    let buffer = {};
    for (const k of texturesOut) {
      buffer[k] = new Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => [0, 0, 0, 0]));
    }
    for (const k of [].concat(texturesIn, texturesOut)) {
      if (!this.textures[k]) {
        this.textures[k] = new Array(this.size)
          .fill(null)
          .map(() => new Array(this.size).fill(null).map(() => [0, 0, 0, 0]));
      }
    }

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const vUV = vec2(x / size, y / size);
        const r = shader(
          vUV,
          this.uniforms,
          texturesIn.map((k) => this.textures[k])
        );
        r.forEach((value, i) => {
          const textureName = texturesOut[i];
          buffer[textureName][y][x] = value;
        });
      }
    }
    Object.assign(this.textures, buffer);
  }
}

function generateTextures(generators, size) {
  let textures = {};
  for (let i = 0; i < generators.length; i += 2) {
    let texture = new Array(size).fill(null).map((_, y) =>
      new Array(size).fill(null).map((_, x) => {
        let e0 = generators[i].energy(x, y, size);
        let d0 = generators[i].direction(x, y, size);
        let e1 = 0;
        let d1 = 0;
        if (generators[i + 1]) {
          e1 = generators[i + 1].energy(x, y, size);
          d1 = generators[i + 1].direction(x, y, size);
        }
        return [cos(d0) * e0, sin(d0) * e0, cos(d1) * e1, sin(d1) * e1];
      })
    );
    textures[`s${i}${i + 1}`] = texture;
  }
  return textures;
}

const size = 4;

// prettier-ignore
const uniforms = {
  // static: [uSize, uTransferRadius],
  // substance: [
  //   uArc0123, uArcWeight0123, uArcBlending0123,
  //   uFlo0123, uFloWeight0123, uFloBlending0123,
  //             uDirWeight0123, uDirBlending0123,
  //   uArc4567, uArcWeight4567, uArcBlending4567,
  //   uFlo4567, uFloWeight4567, uFloBlending4567,
  //             uDirWeight4567, uDirBlending4567,
  // ],
  // substanceAttractionMatrix: [
  //   am0x0123, am1x0123, am2x0123, am3x0123,
  //   am4x0123, am5x0123, am6x0123, am7x0123,
  //   am0x4567, am1x4567, am2x4567, am3x4567,
  //   am4x4567, am5x4567, am6x4567, am7x4567,
  // ]
  static: [size, 1],
  substance: [
    [.5,.5,.5,.5], [1,1,1,1], [1,1,1,1],
    [.5,.5,.5,.5], [1,1,1,1], [1,1,1,1],
                   [1,1,1,1], [1,1,1,1],
    [.5,.5,.5,.5], [1,1,1,1], [1,1,1,1],
    [.5,.5,.5,.5], [1,1,1,1], [1,1,1,1],
                   [1,1,1,1], [1,1,1,1],
  ],
  substanceAttractionMatrix: [
    [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
    [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
    [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
    [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
  ],
  reaction: []
}

// transferPrepare
// transferRun
// substanceReact
// addressPrepare
// reduce(addressPrepare)
// addressRun
// custom
// stats
// reduce(stats)
// display
function cycle(sim: Sim) {
  sim.compute(copyPaste, ['s01'], ['s01Prev']);
  sim.compute(copyPaste, ['s23'], ['s23Prev']);
  sim.compute(copyPaste, ['s45'], ['s45Prev']);
  sim.compute(copyPaste, ['s67'], ['s67Prev']);
  sim.compute(compactLength, ['s01', 's23'], ['s0123Len']);
  sim.compute(compactLength, ['s45', 's67'], ['s4567Len']);
  sim.compute(
    transferPrepare,
    ['s01', 's23', 's45', 's67', 's0123Len', 's4567Len'],
    ['s01FWTFS', 's23FWTFS', 's45FWTFS', 's67FWTFS', 's01Given', 's23Given', 's45Given', 's67Given', 'avgArcAndFlo']
  );
  console.log(sim.reduce('s0123Len')[0]);
  print(sim.textures['s01']);
  print(sim.textures['s01FWTFS']);
  print(sim.textures['s01Given']);
  console.log('-');

  // prettier-ignore
  sim.compute(
    transferRun,
    [
      's01', 's23', 's45', 's67',
      's01FWTFS', 's23FWTFS', 's45FWTFS', 's67FWTFS',
      's01Given', 's23Given', 's45Given', 's67Given',
      'avgArcAndFlo'
    ],
    ['s01', 's23', 's45', 's67']
  );
  // await sim.display([
  //   's01', 's23', 's45', 's67',
  //   's01Prev', 's23Prev', 's45Prev', 's67Prev',
  //   's01Given', 's23Given', 's45Given', 's67Given',
  //   'a0123', 'a4567',
  // ]);
}

function print(texture) {
  const string = texture.map((row) => row.map(([x, y]) => len([x, y]).toFixed(2).padStart(6)).join(' ')).join('\n');
  console.log(string);
}

export default function main() {
  const sim = new Sim();
  (window as any).sim = sim;
  console.log(sim);

  const textures = generateTextures(
    [
      {
        energy: (x, y, size) => {
          return x === 1 && y === 1 ? 0 : 1;
        },
        direction: (x, y, size) => 0,
      },
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
      {energy: (x, y, size) => 0, direction: (x, y, size) => Math.random() * PI2},
    ],
    size
  );
  console.log(uniforms);

  Object.assign(sim.textures, textures);
  sim.size = size;
  sim.uniforms = uniforms;
  cycle(sim);
  cycle(sim);
}
