/* eslint-disable no-lone-blocks, no-eval */

type Texture = Vec4[][];
type Int = number;
type Float = number;
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

const {PI, sin, cos, atan2: atan, floor, round, abs, pow} = Math;
const PI2 = PI * 2.0;
const epsilon = 0.000000001;
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
const min: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => Math.min(a, b));
const max: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => Math.max(a, b));

function divSafe(a: number, b: number, c: number): number;
function divSafe(a: Vec2, b: number, c: number): Vec2;
function divSafe(a: Vec4, b: number, c: number): Vec4;
function divSafe(a: Vec2, b: Vec2, c: number): Vec2;
function divSafe(a: Vec4, b: Vec4, c: number): Vec4;
function divSafe(a: any, b: any, c: number): any {
  return vecMap(a, b, (a, b) => (b === 0.0 ? c : a / b));
}
const mod: VecScalarOp = (x, m) => vecMap(x, m, (x, m) => (x < 0 ? NaN : x % m));
function dot(a: number, b: number): number;
function dot(a: Vec2, b: Vec2): number;
function dot(a: Vec4, b: Vec4): number;
function dot(a: any, b: any): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * b;
  }
  return a.map((_, i) => a[i] * b[i]).reduce((pv, v) => pv + v, 0);
}
const sumVec2 = vec4(1.0, 1.0, 1.0, 1.0);
const sumVec4 = vec4(1.0, 1.0, 1.0, 1.0);
function sum(x: Vec2): number;
function sum(x: Vec4): number;
function sum(x: any): number {
  return x.length === 4 ? dot(x, sumVec4) : dot(x, sumVec2);
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
  const row = tex[mod2(floor(vUV[1] * tex.length + epsilon), tex.length)];
  const cel = row[mod2(floor(vUV[0] * tex.length + epsilon), tex.length)];
  return cel;
}

function getNextBound(bound: Vec4): Vec4 {
  let ix: Float = bound[0];
  let iy: Float = bound[1];
  let it: Float = bound[2];
  let radius: Float = bound[3];
  let ox: Float = 0.0;
  let oy: Float = 0.0;
  let ot: Float = 7.0;
  if (it < PI && abs(ix - 0.5) < radius) {
    let x: Float = ix - 0.5;
    let y: Float = pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix - 1.0;
      oy = iy;
      ot = t;
    }
  }
  if ((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) {
    let y: Float = iy + 0.5;
    let x: Float = pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.0;
      ot = t;
    }
  }
  if (it >= PI && abs(ix + 0.5) < radius) {
    let x: Float = ix + 0.5;
    let y: Float = -pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix + 1.0;
      oy = iy;
      ot = t;
    }
  }
  if (it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) {
    let y: Float = iy - 0.5;
    let x: Float = -pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    let t: Float = atan(y, x);
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
  let length: Float = 0.0;
  let theta: Float = 0.0;
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
    let lo: Float = max(min(loArc, hiCel), loCel);
    let hi: Float = max(min(hiArc, hiCel), loCel);
  
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
  let c01: Vec4 = texture(substance01Tex, vUV);
  let c23: Vec4 = texture(substance23Tex, vUV);
  let s0: Vec2 = vec2(c01[0], c01[1]);
  let s1: Vec2 = vec2(c01[2], c01[3]);
  let s2: Vec2 = vec2(c23[0], c23[1]);
  let s3: Vec2 = vec2(c23[2], c23[3]);

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
  let c01a: Vec4 = texture(substance01aTex, vUV);
  let c23a: Vec4 = texture(substance23aTex, vUV);
  let c45a: Vec4 = texture(substance45aTex, vUV);
  let c67a: Vec4 = texture(substance67aTex, vUV);
  let s0a: Vec2 = vec2(c01a[0], c01a[1]);
  let s1a: Vec2 = vec2(c01a[2], c01a[3]);
  let s2a: Vec2 = vec2(c23a[0], c23a[1]);
  let s3a: Vec2 = vec2(c23a[2], c23a[3]);
  let s4a: Vec2 = vec2(c45a[0], c45a[1]);
  let s5a: Vec2 = vec2(c45a[2], c45a[3]);
  let s6a: Vec2 = vec2(c67a[0], c67a[1]);
  let s7a: Vec2 = vec2(c67a[2], c67a[3]);
  let s0aLen: Float = len(s0a);
  let s1aLen: Float = len(s1a);
  let s2aLen: Float = len(s2a);
  let s3aLen: Float = len(s3a);
  let s4aLen: Float = len(s4a);
  let s5aLen: Float = len(s5a);
  let s6aLen: Float = len(s6a);
  let s7aLen: Float = len(s7a);
  let s0123aLen: Vec4 = vec4(s0aLen, s1aLen, s2aLen, s3aLen);
  let s4567aLen: Vec4 = vec4(s4aLen, s5aLen, s6aLen, s7aLen);
  let s0123aX: Vec4 = vec4(s0a[0], s1a[0], s2a[0], s3a[0]);
  let s4567aX: Vec4 = vec4(s4a[0], s5a[0], s6a[0], s7a[0]);
  let s0123aY: Vec4 = vec4(s0a[1], s1a[1], s2a[1], s3a[1]);
  let s4567aY: Vec4 = vec4(s4a[1], s5a[1], s6a[1], s7a[1]);

  let avgArc: Float = divSafe(
    dot(uArc0123, mul(s0123aLen, uArcWeight0123)) + dot(uArc4567, mul(s4567aLen, uArcWeight4567)),
    dot(s0123aLen, uArcWeight0123) + dot(s4567aLen, uArcWeight4567),
    -1.0
  );
  let avgFlo: Float = divSafe(
    dot(uFlo0123, mul(s0123aLen, uFloWeight0123)) + dot(uFlo4567, mul(s4567aLen, uFloWeight4567)),
    dot(s0123aLen, uFloWeight0123) + dot(s4567aLen, uFloWeight4567),
    -1.0
  );
  let avgDir: Vec2 = normalize(
    vec2(
      dot(s0123aX, uDirWeight0123) + dot(s4567aX, uDirWeight4567),
      dot(s0123aY, uDirWeight0123) + dot(s4567aY, uDirWeight4567)
    )
  );

  let s0123aArc: Vec4 =
    avgArc === -1.0 ? uArc0123 : mix(uArc0123, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending0123);
  let s4567aArc: Vec4 =
    avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);
  let s0123aFlo: Vec4 =
    avgFlo === -1.0 ? uFlo0123 : mix(uFlo0123, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending0123);
  let s4567aFlo: Vec4 =
    avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);
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

  let s0123Bisector: Vec4 = vec4(
    atan(s0a[1], s0a[0]),
    atan(s1a[1], s1a[0]),
    atan(s2a[1], s2a[0]),
    atan(s3a[1], s3a[0])
  );
  let s4567Bisector: Vec4 = vec4(
    atan(s4a[1], s4a[0]),
    atan(s5a[1], s5a[0]),
    atan(s6a[1], s6a[0]),
    atan(s7a[1], s7a[0])
  );
  let s0123aLoBound: Vec4 = mod(add(sub(s0123Bisector, s0123aArc), PI2), PI2);
  let s4567aLoBound: Vec4 = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2);
  let s0123aHiBound: Vec4 = mod(add(add(s0123Bisector, s0123aArc), PI2), PI2);
  let s4567aHiBound: Vec4 = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2);

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

  let s0TransferFractionSum: Float = 0.0;
  let s1TransferFractionSum: Float = 0.0;
  let s2TransferFractionSum: Float = 0.0;
  let s3TransferFractionSum: Float = 0.0;
  let s4TransferFractionSum: Float = 0.0;
  let s5TransferFractionSum: Float = 0.0;
  let s6TransferFractionSum: Float = 0.0;
  let s7TransferFractionSum: Float = 0.0;
  let s0GivenDir: Vec2 = vec2(0.0, 0.0);
  let s1GivenDir: Vec2 = vec2(0.0, 0.0);
  let s2GivenDir: Vec2 = vec2(0.0, 0.0);
  let s3GivenDir: Vec2 = vec2(0.0, 0.0);
  let s4GivenDir: Vec2 = vec2(0.0, 0.0);
  let s5GivenDir: Vec2 = vec2(0.0, 0.0);
  let s6GivenDir: Vec2 = vec2(0.0, 0.0);
  let s7GivenDir: Vec2 = vec2(0.0, 0.0);

  let prevBound: Vec4 = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  let nextBound: Vec4 = getNextBound(prevBound);
  for (let i: Int = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound: Float = prevBound[2];
    let hiBound: Float = nextBound[2];
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV: Vec2 = vec2(vUV[0] + prevBound[0] / uSize, vUV[1] + prevBound[1] / uSize);
    let s0123bLen: Vec4 = texture(substance0123bTex, vvUV);
    let s4567bLen: Vec4 = texture(substance4567bTex, vvUV);

    let s0Attraction: Float = dot(s0123bLen, am0x0123) + dot(s4567bLen, am0x4567);
    let s1Attraction: Float = dot(s0123bLen, am1x0123) + dot(s4567bLen, am1x4567);
    let s2Attraction: Float = dot(s0123bLen, am2x0123) + dot(s4567bLen, am2x4567);
    let s3Attraction: Float = dot(s0123bLen, am3x0123) + dot(s4567bLen, am3x4567);
    let s4Attraction: Float = dot(s0123bLen, am4x0123) + dot(s4567bLen, am4x4567);
    let s5Attraction: Float = dot(s0123bLen, am5x0123) + dot(s4567bLen, am5x4567);
    let s6Attraction: Float = dot(s0123bLen, am6x0123) + dot(s4567bLen, am6x4567);
    let s7Attraction: Float = dot(s0123bLen, am7x0123) + dot(s4567bLen, am7x4567);
    let sAttractionSum: Float =
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

    let s0TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[0], s0123aHiBound[0]), s0Attraction);
    let s1TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[1], s0123aHiBound[1]), s1Attraction);
    let s2TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[2], s0123aHiBound[2]), s2Attraction);
    let s3TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[3], s0123aHiBound[3]), s3Attraction);
    let s4TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction);
    let s5TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction);
    let s6TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction);
    let s7TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction);

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
  let s0FWTFS: Vec2 = mul(normalize(s0a), divSafe(s0TransferFractionSum, s0123aFlo[0], 0.0));
  let s1FWTFS: Vec2 = mul(normalize(s1a), divSafe(s1TransferFractionSum, s0123aFlo[1], 0.0));
  let s2FWTFS: Vec2 = mul(normalize(s2a), divSafe(s2TransferFractionSum, s0123aFlo[2], 0.0));
  let s3FWTFS: Vec2 = mul(normalize(s3a), divSafe(s3TransferFractionSum, s0123aFlo[3], 0.0));
  let s4FWTFS: Vec2 = mul(normalize(s4a), divSafe(s4TransferFractionSum, s4567aFlo[0], 0.0));
  let s5FWTFS: Vec2 = mul(normalize(s5a), divSafe(s5TransferFractionSum, s4567aFlo[1], 0.0));
  let s6FWTFS: Vec2 = mul(normalize(s6a), divSafe(s6TransferFractionSum, s4567aFlo[2], 0.0));
  let s7FWTFS: Vec2 = mul(normalize(s7a), divSafe(s7TransferFractionSum, s4567aFlo[3], 0.0));

  let s01FWTFS: Vec4 = vec4(s0FWTFS[0], s0FWTFS[1], s1FWTFS[0], s1FWTFS[1]);
  let s23FWTFS: Vec4 = vec4(s2FWTFS[0], s2FWTFS[1], s3FWTFS[0], s3FWTFS[1]);
  let s45FWTFS: Vec4 = vec4(s4FWTFS[0], s4FWTFS[1], s5FWTFS[0], s5FWTFS[1]);
  let s67FWTFS: Vec4 = vec4(s6FWTFS[0], s6FWTFS[1], s7FWTFS[0], s7FWTFS[1]);

  let s0Given: Vec2 = mul(normalize(s0GivenDir), s0123aFlo[0]);
  let s1Given: Vec2 = mul(normalize(s1GivenDir), s0123aFlo[1]);
  let s2Given: Vec2 = mul(normalize(s2GivenDir), s0123aFlo[2]);
  let s3Given: Vec2 = mul(normalize(s3GivenDir), s0123aFlo[3]);
  let s4Given: Vec2 = mul(normalize(s4GivenDir), s4567aFlo[0]);
  let s5Given: Vec2 = mul(normalize(s5GivenDir), s4567aFlo[1]);
  let s6Given: Vec2 = mul(normalize(s6GivenDir), s4567aFlo[2]);
  let s7Given: Vec2 = mul(normalize(s7GivenDir), s4567aFlo[3]);

  let s01Given: Vec4 = vec4(s0Given[0], s0Given[1], s1Given[0], s1Given[1]);
  let s23Given: Vec4 = vec4(s2Given[0], s2Given[1], s3Given[0], s3Given[1]);
  let s45Given: Vec4 = vec4(s4Given[0], s4Given[1], s5Given[0], s5Given[1]);
  let s67Given: Vec4 = vec4(s6Given[0], s6Given[1], s7Given[0], s7Given[1]);

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
  let c01b: Vec4 = texture(substance01bTex, vUV);
  let c23b: Vec4 = texture(substance23bTex, vUV);
  let c45b: Vec4 = texture(substance45bTex, vUV);
  let c67b: Vec4 = texture(substance67bTex, vUV);
  let s0b: Vec2 = vec2(c01b[0], c01b[1]);
  let s1b: Vec2 = vec2(c01b[2], c01b[3]);
  let s2b: Vec2 = vec2(c23b[0], c23b[1]);
  let s3b: Vec2 = vec2(c23b[2], c23b[3]);
  let s4b: Vec2 = vec2(c45b[0], c45b[1]);
  let s5b: Vec2 = vec2(c45b[2], c45b[3]);
  let s6b: Vec2 = vec2(c67b[0], c67b[1]);
  let s7b: Vec2 = vec2(c67b[2], c67b[3]);
  let s0bLen: Float = len(s0b);
  let s1bLen: Float = len(s1b);
  let s2bLen: Float = len(s2b);
  let s3bLen: Float = len(s3b);
  let s4bLen: Float = len(s4b);
  let s5bLen: Float = len(s5b);
  let s6bLen: Float = len(s6b);
  let s7bLen: Float = len(s7b);
  let s0123bLen: Vec4 = vec4(s0bLen, s1bLen, s2bLen, s3bLen);
  let s4567bLen: Vec4 = vec4(s4bLen, s5bLen, s6bLen, s7bLen);

  let s0Attraction: Float = dot(s0123bLen, am0x0123) + dot(s4567bLen, am0x4567);
  let s1Attraction: Float = dot(s0123bLen, am1x0123) + dot(s4567bLen, am1x4567);
  let s2Attraction: Float = dot(s0123bLen, am2x0123) + dot(s4567bLen, am2x4567);
  let s3Attraction: Float = dot(s0123bLen, am3x0123) + dot(s4567bLen, am3x4567);
  let s4Attraction: Float = dot(s0123bLen, am4x0123) + dot(s4567bLen, am4x4567);
  let s5Attraction: Float = dot(s0123bLen, am5x0123) + dot(s4567bLen, am5x4567);
  let s6Attraction: Float = dot(s0123bLen, am6x0123) + dot(s4567bLen, am6x4567);
  let s7Attraction: Float = dot(s0123bLen, am7x0123) + dot(s4567bLen, am7x4567);
  let sAttractionSum: Float =
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

  let s0FloLen: Float = 0.0;
  let s1FloLen: Float = 0.0;
  let s2FloLen: Float = 0.0;
  let s3FloLen: Float = 0.0;
  let s4FloLen: Float = 0.0;
  let s5FloLen: Float = 0.0;
  let s6FloLen: Float = 0.0;
  let s7FloLen: Float = 0.0;
  let s0FloDir: Vec2 = vec2(0.0, 0.0);
  let s1FloDir: Vec2 = vec2(0.0, 0.0);
  let s2FloDir: Vec2 = vec2(0.0, 0.0);
  let s3FloDir: Vec2 = vec2(0.0, 0.0);
  let s4FloDir: Vec2 = vec2(0.0, 0.0);
  let s5FloDir: Vec2 = vec2(0.0, 0.0);
  let s6FloDir: Vec2 = vec2(0.0, 0.0);
  let s7FloDir: Vec2 = vec2(0.0, 0.0);

  let prevBound: Vec4 = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  let nextBound: Vec4 = getNextBound(prevBound);
  for (let i: Int = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound: Float = prevBound[2];
    let hiBound: Float = nextBound[2];
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV: Vec2 = vec2(vUV[0] - prevBound[0] / uSize, vUV[1] - prevBound[1] / uSize);
    let c01a: Vec4 = texture(substance01aTex, vvUV);
    let c23a: Vec4 = texture(substance23aTex, vvUV);
    let c45a: Vec4 = texture(substance45aTex, vvUV);
    let c67a: Vec4 = texture(substance67aTex, vvUV);
    let s0aFWTFS: Vec2 = vec2(c01a[0], c01a[1]);
    let s1aFWTFS: Vec2 = vec2(c01a[2], c01a[3]);
    let s2aFWTFS: Vec2 = vec2(c23a[0], c23a[1]);
    let s3aFWTFS: Vec2 = vec2(c23a[2], c23a[3]);
    let s4aFWTFS: Vec2 = vec2(c45a[0], c45a[1]);
    let s5aFWTFS: Vec2 = vec2(c45a[2], c45a[3]);
    let s6aFWTFS: Vec2 = vec2(c67a[0], c67a[1]);
    let s7aFWTFS: Vec2 = vec2(c67a[2], c67a[3]);

    let s0123Bisector: Vec4 = vec4(
      atan(s0aFWTFS[1], s0aFWTFS[0]),
      atan(s1aFWTFS[1], s1aFWTFS[0]),
      atan(s2aFWTFS[1], s2aFWTFS[0]),
      atan(s3aFWTFS[1], s3aFWTFS[0])
    );
    let s4567Bisector: Vec4 = vec4(
      atan(s4aFWTFS[1], s4aFWTFS[0]),
      atan(s5aFWTFS[1], s5aFWTFS[0]),
      atan(s6aFWTFS[1], s6aFWTFS[0]),
      atan(s7aFWTFS[1], s7aFWTFS[0])
    );
    let avgArc: Float = texture(avgArcAndFloTex, vvUV)[0];
    let s0123aArc: Vec4 =
      avgArc === -1.0 ? uArc0123 : mix(uArc0123, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending0123);
    let s4567aArc: Vec4 =
      avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);

    let s0123aLoBound: Vec4 = mod(add(sub(s0123Bisector, s0123aArc), PI2), PI2);
    let s4567aLoBound: Vec4 = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2);
    let s0123aHiBound: Vec4 = mod(add(add(s0123Bisector, s0123aArc), PI2), PI2);
    let s4567aHiBound: Vec4 = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2);
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

    let s0TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[0], s0123aHiBound[0]), s0Attraction);
    let s1TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[1], s0123aHiBound[1]), s1Attraction);
    let s2TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[2], s0123aHiBound[2]), s2Attraction);
    let s3TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s0123aLoBound[3], s0123aHiBound[3]), s3Attraction);
    let s4TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction);
    let s5TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction);
    let s6TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction);
    let s7TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction);

    let s0FloFraction: Vec2 = divSafe(s0TransferFraction, len(s0aFWTFS), 0.0);
    let s1FloFraction: Vec2 = divSafe(s1TransferFraction, len(s1aFWTFS), 0.0);
    let s2FloFraction: Vec2 = divSafe(s2TransferFraction, len(s2aFWTFS), 0.0);
    let s3FloFraction: Vec2 = divSafe(s3TransferFraction, len(s3aFWTFS), 0.0);
    let s4FloFraction: Vec2 = divSafe(s4TransferFraction, len(s4aFWTFS), 0.0);
    let s5FloFraction: Vec2 = divSafe(s5TransferFraction, len(s5aFWTFS), 0.0);
    let s6FloFraction: Vec2 = divSafe(s6TransferFraction, len(s6aFWTFS), 0.0);
    let s7FloFraction: Vec2 = divSafe(s7TransferFraction, len(s7aFWTFS), 0.0);

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

  let c01Given: Vec4 = texture(substance01GivenTex, vUV);
  let c23Given: Vec4 = texture(substance23GivenTex, vUV);
  let c45Given: Vec4 = texture(substance45GivenTex, vUV);
  let c67Given: Vec4 = texture(substance67GivenTex, vUV);
  let s0Given: Vec2 = vec2(c01Given[0], c01Given[1]);
  let s1Given: Vec2 = vec2(c01Given[2], c01Given[3]);
  let s2Given: Vec2 = vec2(c23Given[0], c23Given[1]);
  let s3Given: Vec2 = vec2(c23Given[2], c23Given[3]);
  let s4Given: Vec2 = vec2(c45Given[0], c45Given[1]);
  let s5Given: Vec2 = vec2(c45Given[2], c45Given[3]);
  let s6Given: Vec2 = vec2(c67Given[0], c67Given[1]);
  let s7Given: Vec2 = vec2(c67Given[2], c67Given[3]);

  let s0Received: Vec2 = mul(normalize(s0FloDir), s0FloLen);
  let s1Received: Vec2 = mul(normalize(s1FloDir), s1FloLen);
  let s2Received: Vec2 = mul(normalize(s2FloDir), s2FloLen);
  let s3Received: Vec2 = mul(normalize(s3FloDir), s3FloLen);
  let s4Received: Vec2 = mul(normalize(s4FloDir), s4FloLen);
  let s5Received: Vec2 = mul(normalize(s5FloDir), s5FloLen);
  let s6Received: Vec2 = mul(normalize(s6FloDir), s6FloLen);
  let s7Received: Vec2 = mul(normalize(s7FloDir), s7FloLen);

  let avgFlo: Float = texture(avgArcAndFloTex, vUV)[1];
  let s0123bFlo: Vec4 =
    avgFlo === -1.0 ? uFlo0123 : mix(uFlo0123, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending0123);
  let s4567bFlo: Vec4 =
    avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);

  let s0Remaining: Vec2 = mul(s0b, 1.0 - s0123bFlo[0]);
  let s1Remaining: Vec2 = mul(s1b, 1.0 - s0123bFlo[1]);
  let s2Remaining: Vec2 = mul(s2b, 1.0 - s0123bFlo[2]);
  let s3Remaining: Vec2 = mul(s3b, 1.0 - s0123bFlo[3]);
  let s4Remaining: Vec2 = mul(s4b, 1.0 - s4567bFlo[0]);
  let s5Remaining: Vec2 = mul(s5b, 1.0 - s4567bFlo[1]);
  let s6Remaining: Vec2 = mul(s6b, 1.0 - s4567bFlo[2]);
  let s7Remaining: Vec2 = mul(s7b, 1.0 - s4567bFlo[3]);

  let s0: Vec2 = mul(normalize(add(add(s0Given, s0Received), s0Remaining)), len(s0Received) + len(s0Remaining));
  let s1: Vec2 = mul(normalize(add(add(s1Given, s1Received), s1Remaining)), len(s1Received) + len(s1Remaining));
  let s2: Vec2 = mul(normalize(add(add(s2Given, s2Received), s2Remaining)), len(s2Received) + len(s2Remaining));
  let s3: Vec2 = mul(normalize(add(add(s3Given, s3Received), s3Remaining)), len(s3Received) + len(s3Remaining));
  let s4: Vec2 = mul(normalize(add(add(s4Given, s4Received), s4Remaining)), len(s4Received) + len(s4Remaining));
  let s5: Vec2 = mul(normalize(add(add(s5Given, s5Received), s5Remaining)), len(s5Received) + len(s5Remaining));
  let s6: Vec2 = mul(normalize(add(add(s6Given, s6Received), s6Remaining)), len(s6Received) + len(s6Remaining));
  let s7: Vec2 = mul(normalize(add(add(s7Given, s7Received), s7Remaining)), len(s7Received) + len(s7Remaining));

  let s01: Vec4 = vec4(s0[0], s0[1], s1[0], s1[1]);
  let s23: Vec4 = vec4(s2[0], s2[1], s3[0], s3[1]);
  let s45: Vec4 = vec4(s4[0], s4[1], s5[0], s5[1]);
  let s67: Vec4 = vec4(s6[0], s6[1], s7[0], s7[1]);

  return [s01, s23, s45, s67];
}

function substanceReactParse(config) {
  const reactionStrings = config.reactions;
  const symbols = new Array(8).fill('');
  config.substances.forEach((s, i) => {
    symbols[i] = s.symbol;
  });
  symbols.push(...['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']);
  if (config.substances.includes((s) => /a[0-7]/.test(s.symbol))) {
    throw new Error('Symbols cannot take the form of a0, a1, a2... they are reserved');
  }
  if (Array.from(new Set(symbols)).length < Math.min(config.substances.length + 9, 16)) {
    throw new Error('Every symbol must be unique');
  }

  /**
   * 'A + B -> 2A, 1.0' =>
   * input: [{quantity: 1, symbol: 'A'}, {quantity: 1, symbol: 'B'}],
   * output: [{quantity: 2, symbol: 'A'}],
   * weight: 1
   */
  const reactions = reactionStrings
    .map((text) => {
      const [, input, output, weight] = text.match(/(.+)->(.+),(.+)/);
      const reaction = {
        text,
        input: input.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/);
          return {quantity: +(quantity || '1'), symbol};
        }),
        output: output.split('+').map((str) => {
          const [, quantity, symbol] = str.match(/(\d*)([A-Za-z]\w*)/);
          return {quantity: +(quantity || '1'), symbol};
        }),
        weight: weight.trim(),
      };
      if (
        reaction.input.reduce((pv, v) => pv + v.quantity, 0) !== reaction.output.reduce((pv, v) => pv + v.quantity, 0)
      ) {
        throw new Error(`Every reaction must be balanced ('${reaction.text}' is not)`);
      }
      let inputAddresses = {};
      reaction.input.forEach(({symbol}) => {
        if (/a[0-7]/.test(symbol)) inputAddresses[symbol] = true;
      });
      reaction.output.forEach(({symbol}) => {
        if (inputAddresses[symbol]) {
          throw new Error(`An address cannot send energy to itself (${symbol} -> ${symbol})`);
        }
      });
      return reaction;
    })
    .map((reaction) => {
      const input = new Array(16).fill(0);
      const output = new Array(16).fill(0);
      reaction.input.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol);
        if (index === -1) {
          throw new Error(`${symbol} is not a defined symbol`);
        }
        input[index] += quantity;
      });
      reaction.output.forEach(({quantity, symbol}) => {
        const index = symbols.indexOf(symbol);
        if (index === -1) {
          throw new Error(`${symbol} is not a defined symbol`);
        }
        output[index] += quantity;
      });
      // TODO: parse weight
      // all symbols in equation must be described elsewhere.
      // weight must simultaneously be a valid JavaScript and GLSL expression which yields a float
      // must not contain a semicolon
      // prettier-ignore
      return {
        uniforms: [
          input.slice(0, 4), input.slice(4, 8), input.slice(8, 12), input.slice(12, 16),
          output.slice(0, 4), output.slice(4, 8), output.slice(8, 12), output.slice(12, 16),
        ],
        weight: reaction.weight,
      };
    });

  return reactions;
}

function substanceReactGenerator(config) {
  const reactions = substanceReactParse(config);
  function substanceReact(vUV: Vec2, uniforms, textures: Texture[]) {
    const [substance01Tex, substance23Tex, substance45Tex, substance67Tex, address0123Tex, address4567Tex] = textures;
    let cs01: Vec4 = texture(substance01Tex, vUV);
    let cs23: Vec4 = texture(substance23Tex, vUV);
    let cs45: Vec4 = texture(substance45Tex, vUV);
    let cs67: Vec4 = texture(substance67Tex, vUV);
    let ca0123: Vec4 = texture(address0123Tex, vUV);
    let ca4567: Vec4 = texture(address4567Tex, vUV);
    let initial0: Vec4 = vec4(
      len(vec2(cs01[0], cs01[1])),
      len(vec2(cs01[2], cs01[3])),
      len(vec2(cs23[0], cs23[1])),
      len(vec2(cs23[2], cs23[3]))
    );
    let initial1: Vec4 = vec4(
      len(vec2(cs45[0], cs45[1])),
      len(vec2(cs45[2], cs45[3])),
      len(vec2(cs67[0], cs67[1])),
      len(vec2(cs67[2], cs67[3]))
    );
    let initial2: Vec4 = vec4(max(ca0123[0], 0.0), max(ca0123[1], 0.0), max(ca0123[2], 0.0), max(ca0123[3], 0.0));
    let initial3: Vec4 = vec4(max(ca4567[0], 0.0), max(ca4567[1], 0.0), max(ca4567[2], 0.0), max(ca4567[3], 0.0));

    let input0: Vec4 = initial0;
    let input1: Vec4 = initial1;
    let input2: Vec4 = initial2;
    let input3: Vec4 = initial3;
    let output0: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
    let output1: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
    let output2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
    let output3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);

    const rWeights = reactions.map((r) => eval(r.weight));

    for (let i: Int = 0; i < 16; i++) {
      let i0: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i1: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o0: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o1: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);

      for (const i in reactions) {
        const [rInput0, rInput1, rInput2, rInput3, rOutput0, rOutput1, rOutput2, rOutput3] = reactions[i].uniforms;
        const rWeight = rWeights[i];
        if (
          // if the output of a reaction is an address, and the current grid cell is that address, skip the reaction
          dot(initial2, rOutput2) === 0.0 &&
          dot(initial3, rOutput3) === 0.0
        ) {
          let iaVec: Vec4 = min(
            min(divSafe(input0, rInput0, 9999999.9), divSafe(input1, rInput1, 9999999.9)),
            min(divSafe(input2, rInput2, 9999999.9), divSafe(input3, rInput3, 9999999.9))
          );
          let inputAvailability: Float = min(min(iaVec[0], iaVec[1]), min(iaVec[2], iaVec[3]));
          let reactionSpeed: Float = inputAvailability * rWeight;
          i0 = add(i0, mul(rInput0, reactionSpeed));
          i1 = add(i1, mul(rInput1, reactionSpeed));
          i2 = add(i2, mul(rInput2, reactionSpeed));
          i3 = add(i3, mul(rInput3, reactionSpeed));
          o0 = add(o0, mul(rOutput0, reactionSpeed));
          o1 = add(o1, mul(rOutput1, reactionSpeed));
          o2 = add(o2, mul(rOutput2, reactionSpeed));
          o3 = add(o3, mul(rOutput3, reactionSpeed));
        }
      }
      let scalebackVec: Vec4 = max(
        max(divSafe(input0, i0, 0.0), divSafe(input1, i1, 0.0)),
        max(divSafe(input2, i2, 0.0), divSafe(input3, i3, 0.0))
      );
      let scaleback: Float = min(
        max(max(scalebackVec[0], scalebackVec[1]), max(scalebackVec[2], scalebackVec[3])),
        1.0
      );
      input0 = sub(input0, mul(i0, scaleback));
      input1 = sub(input1, mul(i1, scaleback));
      input2 = sub(input2, mul(i2, scaleback));
      input3 = sub(input3, mul(i3, scaleback));
      output0 = add(output0, mul(o0, scaleback));
      output1 = add(output1, mul(o1, scaleback));
      output2 = add(output2, mul(o2, scaleback));
      output3 = add(output3, mul(o3, scaleback));
      if (sum(vec4(sum(i0), sum(i1), sum(i2), sum(i3))) < epsilon) {
        break;
      }
    }
    let final0: Vec4 = max(add(input0, output0), 0.0);
    let final1: Vec4 = max(add(input1, output1), 0.0);
    let s0: Vec2 = mul(normalize(vec2(cs01[0], cs01[1])), final0[0]);
    let s1: Vec2 = mul(normalize(vec2(cs01[2], cs01[3])), final0[1]);
    let s2: Vec2 = mul(normalize(vec2(cs23[0], cs23[1])), final0[2]);
    let s3: Vec2 = mul(normalize(vec2(cs23[2], cs23[3])), final0[3]);
    let s4: Vec2 = mul(normalize(vec2(cs45[0], cs45[1])), final1[0]);
    let s5: Vec2 = mul(normalize(vec2(cs45[2], cs45[3])), final1[1]);
    let s6: Vec2 = mul(normalize(vec2(cs67[0], cs67[1])), final1[2]);
    let s7: Vec2 = mul(normalize(vec2(cs67[2], cs67[3])), final1[3]);
    // TODO: if initial address >0 do max(epsilon)
    let a0123: Vec4 = sub(input2, output2);
    let a4567: Vec4 = sub(input3, output3);

    return [
      vec4(s0[0], s0[1], s1[0], s1[1]),
      vec4(s2[0], s2[1], s3[0], s3[1]),
      vec4(s4[0], s4[1], s5[0], s5[1]),
      vec4(s6[0], s6[1], s7[0], s7[1]),
      a0123,
      a4567,
    ];
  }

  return substanceReact;
}
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
        const vUV = vec2(x / this.size, y / this.size);
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

// prettier-ignore
const config = {
  seed: -1,
  size: 1,
  transferRadius: 1,
  substances: [
    {symbol: 'A', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'B', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'C', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'D', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'E', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'F', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'G', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
    {symbol: 'H', arc: 1, arcWeight: 1, arcBlending: 0, flo: 0.5, floWeight: 1, floBlending: 0, dirWeight: 1, dirBlending: 0},
  ],
  substanceAttractionMatrix: {
    '00': 1, '01': 1, '02': 1, '03': 1, '04': 1, '05': 1, '06': 1, '07': 1,
    '10': 1, '11': 1, '12': 1, '13': 1, '14': 1, '15': 1, '16': 1, '17': 1,
    '20': 1, '21': 1, '22': 1, '23': 1, '24': 1, '25': 1, '26': 1, '27': 1,
    '30': 1, '31': 1, '32': 1, '33': 1, '34': 1, '35': 1, '36': 1, '37': 1,
    '40': 1, '41': 1, '42': 1, '43': 1, '44': 1, '45': 1, '46': 1, '47': 1,
    '50': 1, '51': 1, '52': 1, '53': 1, '54': 1, '55': 1, '56': 1, '57': 1,
    '60': 1, '61': 1, '62': 1, '63': 1, '64': 1, '65': 1, '66': 1, '67': 1,
    '70': 1, '71': 1, '72': 1, '73': 1, '74': 1, '75': 1, '76': 1, '77': 1,
  },
  reactionParameters: {},
  reactions: [
    "A -> B, 1.0",
  ],
}

const configToUniforms = (config) => {
  const substanceAttribute = (offset, key) => {
    const a = new Array(4).fill(0);
    config.substances.slice(offset * 4, 4 + offset * 4).forEach((s, i) => {
      a[i] = s[key];
    });
    return a;
  };
  const am = config.substanceAttractionMatrix;

  // prettier-ignore
  const uniforms = {
    static: [config.size, config.transferRadius],
    substance: [
      substanceAttribute(0, 'arc'), substanceAttribute(0, 'arcWeight'), substanceAttribute(0, 'arcBlending'),
      substanceAttribute(0, 'flo'), substanceAttribute(0, 'floWeight'), substanceAttribute(0, 'floBlending'),
                                    substanceAttribute(0, 'dirWeight'), substanceAttribute(0, 'dirBlending'),
      substanceAttribute(1, 'arc'), substanceAttribute(1, 'arcWeight'), substanceAttribute(1, 'arcBlending'),
      substanceAttribute(1, 'flo'), substanceAttribute(1, 'floWeight'), substanceAttribute(1, 'floBlending'),
                                    substanceAttribute(1, 'dirWeight'), substanceAttribute(1, 'dirBlending'),
    ],
    substanceAttractionMatrix: [
      [am['00'],am['01'],am['02'],am['03']], [am['10'],am['11'],am['12'],am['13']],
      [am['20'],am['21'],am['22'],am['23']], [am['30'],am['31'],am['32'],am['33']],
      [am['40'],am['41'],am['42'],am['43']], [am['50'],am['51'],am['52'],am['53']],
      [am['60'],am['61'],am['62'],am['63']], [am['70'],am['71'],am['72'],am['73']],
      [am['04'],am['05'],am['06'],am['07']], [am['14'],am['15'],am['16'],am['17']],
      [am['24'],am['25'],am['26'],am['27']], [am['34'],am['35'],am['36'],am['37']],
      [am['44'],am['45'],am['46'],am['47']], [am['54'],am['55'],am['56'],am['57']],
      [am['64'],am['65'],am['66'],am['67']], [am['74'],am['75'],am['76'],am['77']],
    ],
    reactionParameters: []
  }

  return uniforms;
};

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
  console.log(sim.reduce('s0123Len'));
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
  const substanceReact = substanceReactGenerator(config);
  sim.compute(
    substanceReact,
    ['s01', 's23', 's45', 's67', 'a0123', 'a4567'],
    ['s01', 's23', 's45', 's67', 'a0123', 'a4567']
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
  const uniforms = configToUniforms(config);

  const textures = generateTextures(
    [
      {
        energy: (x, y, size) => {
          return 1;
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
    config.size
  );

  Object.assign(sim.textures, textures);
  sim.size = config.size;
  sim.uniforms = uniforms;
  cycle(sim);
}
