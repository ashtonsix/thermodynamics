#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform sampler2D texture5;
uniform sampler2D texture6;
uniform sampler2D texture7;
uniform sampler2D texture8;
uniform sampler2D texture9;
uniform sampler2D texture10;
uniform sampler2D texture11;
layout(std140) uniform StaticUniforms {
  float uSize;
  float uTransferRadius;
};
layout(std140) uniform SubstanceUniforms {
  vec4 uArc012_;
  vec4 uArcWeight012_;
  vec4 uArcBlending012_;
  vec4 uFlo012_;
  vec4 uFloWeight012_;
  vec4 uFloBlending012_;
  vec4 uDirWeight012_;
  vec4 uDirBlending012_;
  vec4 uArc4567;
  vec4 uArcWeight4567;
  vec4 uArcBlending4567;
  vec4 uFlo4567;
  vec4 uFloWeight4567;
  vec4 uFloBlending4567;
  vec4 uDirWeight4567;
  vec4 uDirBlending4567;
};
layout(std140) uniform SubstanceAttractionMatrixUniforms {
  vec4 am0x012_;
  vec4 am1x012_;
  vec4 am2x012_;
  vec4 am_x012_;
  vec4 am4x012_;
  vec4 am5x012_;
  vec4 am6x012_;
  vec4 am7x012_;
  vec4 am0x4567;
  vec4 am1x4567;
  vec4 am2x4567;
  vec4 am_x4567;
  vec4 am4x4567;
  vec4 am5x4567;
  vec4 am6x4567;
  vec4 am7x4567;
};
layout(location=0) out vec4 fragColor0;
layout(location=1) out vec4 fragColor1;
layout(location=2) out vec4 fragColor2;
layout(location=3) out vec4 fragColor3;
layout(location=4) out vec4 fragColor4;
layout(location=5) out vec4 fragColor5;
layout(location=6) out vec4 fragColor6;
layout(location=7) out vec4 fragColor7;

float PI = 3.141592653589793;
float PI2 = 6.283185307179586;
float epsilon = 0.000000001;
float bigilon = 999999999.9;

float divSafe(in float a, in float b, in float c) {
  return b == 0.0 ? c : a / b;
}
vec2 divSafe(in vec2 a, in float b, in float c) {
  return b == 0.0 ? vec2(c, c) : a / b;
}
vec4 divSafe(in vec4 a, in float b, in float c) {
  return b == 0.0 ? vec4(c, c, c, c) : a / b;
}
vec2 divSafe(in vec2 a, in vec2 b, in float c) {
  return vec2(
    b.x == 0.0 ? c : a.x / b.x,
    b.y == 0.0 ? c : a.y / b.y
  );
}
vec4 divSafe(in vec4 a, in vec4 b, in float c) {
  return vec4(
    b.x == 0.0 ? c : a.x / b.x,
    b.y == 0.0 ? c : a.y / b.y,
    b.z == 0.0 ? c : a.z / b.z,
    b.w == 0.0 ? c : a.w / b.w
  );
}

vec2 normalizeSafe(in vec2 v) {
  return (v.x == 0.0 && v.y == 0.0) ? vec2(0.0, 0.0) : normalize(v);
}

vec4 sumVec = vec4(1.0, 1.0, 1.0, 1.0);
float sum(in vec4 x) {
  return dot(x, sumVec);
}

vec4 getNextBound(in vec4 bound) {
  float ix = bound.x;
  float iy = bound.y;
  float it = bound.z;
  float radius = bound.w;
  float ox = 0.0;
  float oy = 0.0;
  float ot = 7.0;
  if (it < PI && abs(ix - 0.5) < radius) {
    float x = ix - 0.5;
    float y = pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix - 1.0;
      oy = iy;
      ot = t;
    }
  }
  if ((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) {
    float y = iy + 0.5;
    float x = pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.0;
      ot = t;
    }
  }
  if (it >= PI && abs(ix + 0.5) < radius) {
    float x = ix + 0.5;
    float y = -pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix + 1.0;
      oy = iy;
      ot = t;
    }
  }
  if (it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) {
    float y = iy - 0.5;
    float x = -pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy - 1.0;
      ot = t;
    }
  }
  return vec4(ox, oy, ot, radius);
}

vec2 arcOverlap(in float loCel, in float hiCel, in float loArc, in float hiArc) {
  float length = 0.0;
  float theta = 0.0;
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
    float lo = max(min(loArc, hiCel), loCel);
    float hi = max(min(hiArc, hiCel), loCel);
  
    length = (hi - lo) / (hiArc - loArc);
    theta = mod((lo + hi) / 2.0, PI2);
  }

  return vec2(cos(theta) * length, sin(theta) * length);
}

void copyPaste() {
  fragColor0 = texture(texture0, vUV);
}

void compactLength() {
  vec4 c01 = texture(texture0, vUV); // substance01
  vec4 c23 = texture(texture1, vUV); // substance23
  vec2 s0 = vec2(c01.x, c01.y);
  vec2 s1 = vec2(c01.z, c01.w);
  vec2 s2 = vec2(c23.x, c23.y);
  vec2 s3 = vec2(c23.z, c23.w);

  fragColor0 = vec4(length(s0), length(s1), length(s2), length(s3));
}

void transferPrepare() {
  vec4 test = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 c01a = texture(texture0, vUV); // substance01a
  vec4 c2_a = texture(texture1, vUV); // substance2_a
  vec4 c45a = texture(texture3, vUV); // substance45a
  vec4 c67a = texture(texture4, vUV); // substance67a
  c2_a.z = 0.0;
  c2_a.w = 0.0;
  vec2 s0a = vec2(c01a.x, c01a.y);
  vec2 s1a = vec2(c01a.z, c01a.w);
  vec2 s2a = vec2(c2_a.x, c2_a.y);
  vec2 s_a = vec2(c2_a.z, c2_a.w);
  vec2 s4a = vec2(c45a.x, c45a.y);
  vec2 s5a = vec2(c45a.z, c45a.w);
  vec2 s6a = vec2(c67a.x, c67a.y);
  vec2 s7a = vec2(c67a.z, c67a.w);
  float s0aLen = length(s0a);
  float s1aLen = length(s1a);
  float s2aLen = length(s2a);
  float s_aLen = length(s_a);
  float s4aLen = length(s4a);
  float s5aLen = length(s5a);
  float s6aLen = length(s6a);
  float s7aLen = length(s7a);
  vec4 s012_aLen = vec4(s0aLen, s1aLen, s2aLen, s_aLen);
  vec4 s4567aLen = vec4(s4aLen, s5aLen, s6aLen, s7aLen);
  vec4 s012_aX = vec4(s0a.x, s1a.x, s2a.x, s_a.x);
  vec4 s4567aX = vec4(s4a.x, s5a.x, s6a.x, s7a.x);
  vec4 s012_aY = vec4(s0a.y, s1a.y, s2a.y, s_a.y);
  vec4 s4567aY = vec4(s4a.y, s5a.y, s6a.y, s7a.y);

  float avgArc = divSafe(
    dot(uArc012_, (s012_aLen * uArcWeight012_)) + dot(uArc4567, (s4567aLen * uArcWeight4567)),
    dot(s012_aLen, uArcWeight012_) + dot(s4567aLen, uArcWeight4567),
    -1.0
  );
  float avgFlo = divSafe(
    dot(uFlo012_, (s012_aLen * uFloWeight012_)) + dot(uFlo4567, (s4567aLen * uFloWeight4567)),
    dot(s012_aLen, uFloWeight012_) + dot(s4567aLen, uFloWeight4567),
    -1.0
  );
  vec2 avgDir = normalizeSafe(
    vec2(
      dot(s012_aX, uDirWeight012_) + dot(s4567aX, uDirWeight4567),
      dot(s012_aY, uDirWeight012_) + dot(s4567aY, uDirWeight4567)
    )
  );

  vec4 s012_aArc = avgArc == -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
  vec4 s4567aArc = avgArc == -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);
  vec4 s012_aFlo = avgFlo == -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  vec4 s4567aFlo = avgFlo == -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);
  s012_aFlo = (s012_aFlo * s012_aLen);
  s4567aFlo = (s4567aFlo * s4567aLen);
  s0a = (normalizeSafe(mix(normalizeSafe(s0a), avgDir, uDirBlending012_.x)) * s0aLen);
  s1a = (normalizeSafe(mix(normalizeSafe(s1a), avgDir, uDirBlending012_.y)) * s1aLen);
  s2a = (normalizeSafe(mix(normalizeSafe(s2a), avgDir, uDirBlending012_.z)) * s2aLen);
  s_a = (normalizeSafe(mix(normalizeSafe(s_a), avgDir, uDirBlending012_.w)) * s_aLen);
  s4a = (normalizeSafe(mix(normalizeSafe(s4a), avgDir, uDirBlending4567.x)) * s4aLen);
  s5a = (normalizeSafe(mix(normalizeSafe(s5a), avgDir, uDirBlending4567.y)) * s5aLen);
  s6a = (normalizeSafe(mix(normalizeSafe(s6a), avgDir, uDirBlending4567.z)) * s6aLen);
  s7a = (normalizeSafe(mix(normalizeSafe(s7a), avgDir, uDirBlending4567.w)) * s7aLen);


  vec4 s012_Bisector = vec4(
    atan(s0a.y, s0a.x),
    atan(s1a.y, s1a.x),
    atan(s2a.y, s2a.x),
    atan(s_a.y, s_a.x)
  );
  vec4 s4567Bisector = vec4(
    atan(s4a.y, s4a.x),
    atan(s5a.y, s5a.x),
    atan(s6a.y, s6a.x),
    atan(s7a.y, s7a.x)
  );
  vec4 s012_aLoBound = mod(((s012_Bisector - s012_aArc) + PI2), PI2);
  vec4 s4567aLoBound = mod(((s4567Bisector - s4567aArc) + PI2), PI2);
  vec4 s012_aHiBound = mod(((s012_Bisector + s012_aArc) + PI2), PI2);
  vec4 s4567aHiBound = mod(((s4567Bisector + s4567aArc) + PI2), PI2);

  s012_aHiBound = vec4(
    s012_aLoBound.x > s012_aHiBound.x ? s012_aHiBound.x + PI2 : s012_aHiBound.x,
    s012_aLoBound.y > s012_aHiBound.y ? s012_aHiBound.y + PI2 : s012_aHiBound.y,
    s012_aLoBound.z > s012_aHiBound.z ? s012_aHiBound.z + PI2 : s012_aHiBound.z,
    s012_aLoBound.w > s012_aHiBound.w ? s012_aHiBound.w + PI2 : s012_aHiBound.w
  );
  s4567aHiBound = vec4(
    s4567aLoBound.x > s4567aHiBound.x ? s4567aHiBound.x + PI2 : s4567aHiBound.x,
    s4567aLoBound.y > s4567aHiBound.y ? s4567aHiBound.y + PI2 : s4567aHiBound.y,
    s4567aLoBound.z > s4567aHiBound.z ? s4567aHiBound.z + PI2 : s4567aHiBound.z,
    s4567aLoBound.w > s4567aHiBound.w ? s4567aHiBound.w + PI2 : s4567aHiBound.w
  );

  float s0TransferFractionSum = 0.0;
  float s1TransferFractionSum = 0.0;
  float s2TransferFractionSum = 0.0;
  float s_TransferFractionSum = 0.0;
  float s4TransferFractionSum = 0.0;
  float s5TransferFractionSum = 0.0;
  float s6TransferFractionSum = 0.0;
  float s7TransferFractionSum = 0.0;
  vec2 s0GivenDir = vec2(0.0, 0.0);
  vec2 s1GivenDir = vec2(0.0, 0.0);
  vec2 s2GivenDir = vec2(0.0, 0.0);
  vec2 s_GivenDir = vec2(0.0, 0.0);
  vec2 s4GivenDir = vec2(0.0, 0.0);
  vec2 s5GivenDir = vec2(0.0, 0.0);
  vec2 s6GivenDir = vec2(0.0, 0.0);
  vec2 s7GivenDir = vec2(0.0, 0.0);

  vec4 prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  vec4 nextBound = getNextBound(prevBound);
  for (int i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    float loBound = prevBound.z;
    float hiBound = nextBound.z;
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    vec2 vvUV = vec2(vUV.x + prevBound.x / uSize, vUV.y + prevBound.y / uSize);
    vec4 s012_bLen = texture(texture2, vvUV); // substance012_b
    vec4 s4567bLen = texture(texture5, vvUV); // substance4567b
    s012_bLen.w = 0.0;

    float s0Attraction = dot(s012_bLen, am0x012_) + dot(s4567bLen, am0x4567);
    float s1Attraction = dot(s012_bLen, am1x012_) + dot(s4567bLen, am1x4567);
    float s2Attraction = dot(s012_bLen, am2x012_) + dot(s4567bLen, am2x4567);
    float s_Attraction = dot(s012_bLen, am_x012_) + dot(s4567bLen, am_x4567);
    float s4Attraction = dot(s012_bLen, am4x012_) + dot(s4567bLen, am4x4567);
    float s5Attraction = dot(s012_bLen, am5x012_) + dot(s4567bLen, am5x4567);
    float s6Attraction = dot(s012_bLen, am6x012_) + dot(s4567bLen, am6x4567);
    float s7Attraction = dot(s012_bLen, am7x012_) + dot(s4567bLen, am7x4567);
    float sAttractionSum =
      sum(vec4(s0Attraction, s1Attraction, s2Attraction, s_Attraction)) +
      sum(vec4(s4Attraction, s5Attraction, s6Attraction, s7Attraction));
    s0Attraction = sAttractionSum == 0.0 ? 1.0 : s0Attraction / sAttractionSum;
    s1Attraction = sAttractionSum == 0.0 ? 1.0 : s1Attraction / sAttractionSum;
    s2Attraction = sAttractionSum == 0.0 ? 1.0 : s2Attraction / sAttractionSum;
    s_Attraction = sAttractionSum == 0.0 ? 1.0 : s_Attraction / sAttractionSum;
    s4Attraction = sAttractionSum == 0.0 ? 1.0 : s4Attraction / sAttractionSum;
    s5Attraction = sAttractionSum == 0.0 ? 1.0 : s5Attraction / sAttractionSum;
    s6Attraction = sAttractionSum == 0.0 ? 1.0 : s6Attraction / sAttractionSum;
    s7Attraction = sAttractionSum == 0.0 ? 1.0 : s7Attraction / sAttractionSum;

    vec2 s0TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.x, s012_aHiBound.x) * s0Attraction);
    vec2 s1TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.y, s012_aHiBound.y) * s1Attraction);
    vec2 s2TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.z, s012_aHiBound.z) * s2Attraction);
    vec2 s_TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.w, s012_aHiBound.w) * s_Attraction);
    vec2 s4TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.x, s4567aHiBound.x) * s4Attraction);
    vec2 s5TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.y, s4567aHiBound.y) * s5Attraction);
    vec2 s6TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.z, s4567aHiBound.z) * s6Attraction);
    vec2 s7TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.w, s4567aHiBound.w) * s7Attraction);

    s0TransferFractionSum += length(s0TransferFraction);
    s1TransferFractionSum += length(s1TransferFraction);
    s2TransferFractionSum += length(s2TransferFraction);
    s_TransferFractionSum += length(s_TransferFraction);
    s4TransferFractionSum += length(s4TransferFraction);
    s5TransferFractionSum += length(s5TransferFraction);
    s6TransferFractionSum += length(s6TransferFraction);
    s7TransferFractionSum += length(s7TransferFraction);

    s0GivenDir = (s0GivenDir + s0TransferFraction);
    s1GivenDir = (s1GivenDir + s1TransferFraction);
    s2GivenDir = (s2GivenDir + s2TransferFraction);
    s_GivenDir = (s_GivenDir + s_TransferFraction);
    s4GivenDir = (s4GivenDir + s4TransferFraction);
    s5GivenDir = (s5GivenDir + s5TransferFraction);
    s6GivenDir = (s6GivenDir + s6TransferFraction);
    s7GivenDir = (s7GivenDir + s7TransferFraction);

    if (hiBound > PI2) {
      break;
    }
  }

  // flowWeightedTransferFractionSum
  vec2 s0FWTFS = (normalizeSafe(s0a) * divSafe(s0TransferFractionSum, s012_aFlo.x, 0.0));
  vec2 s1FWTFS = (normalizeSafe(s1a) * divSafe(s1TransferFractionSum, s012_aFlo.y, 0.0));
  vec2 s2FWTFS = (normalizeSafe(s2a) * divSafe(s2TransferFractionSum, s012_aFlo.z, 0.0));
  vec2 s_FWTFS = (normalizeSafe(s_a) * divSafe(s_TransferFractionSum, s012_aFlo.w, 0.0));
  vec2 s4FWTFS = (normalizeSafe(s4a) * divSafe(s4TransferFractionSum, s4567aFlo.x, 0.0));
  vec2 s5FWTFS = (normalizeSafe(s5a) * divSafe(s5TransferFractionSum, s4567aFlo.y, 0.0));
  vec2 s6FWTFS = (normalizeSafe(s6a) * divSafe(s6TransferFractionSum, s4567aFlo.z, 0.0));
  vec2 s7FWTFS = (normalizeSafe(s7a) * divSafe(s7TransferFractionSum, s4567aFlo.w, 0.0));

  vec4 s01FWTFS = vec4(s0FWTFS.x, s0FWTFS.y, s1FWTFS.x, s1FWTFS.y);
  vec4 s2_FWTFS = vec4(s2FWTFS.x, s2FWTFS.y, s_FWTFS.x, s_FWTFS.y);
  vec4 s45FWTFS = vec4(s4FWTFS.x, s4FWTFS.y, s5FWTFS.x, s5FWTFS.y);
  vec4 s67FWTFS = vec4(s6FWTFS.x, s6FWTFS.y, s7FWTFS.x, s7FWTFS.y);

  vec2 s0Given = (normalizeSafe(s0GivenDir) * s012_aFlo.x);
  vec2 s1Given = (normalizeSafe(s1GivenDir) * s012_aFlo.y);
  vec2 s2Given = (normalizeSafe(s2GivenDir) * s012_aFlo.z);
  vec2 s_Given = (normalizeSafe(s_GivenDir) * s012_aFlo.w);
  vec2 s4Given = (normalizeSafe(s4GivenDir) * s4567aFlo.x);
  vec2 s5Given = (normalizeSafe(s5GivenDir) * s4567aFlo.y);
  vec2 s6Given = (normalizeSafe(s6GivenDir) * s4567aFlo.z);
  vec2 s7Given = (normalizeSafe(s7GivenDir) * s4567aFlo.w);

  vec4 s01Given = vec4(s0Given.x, s0Given.y, s1Given.x, s1Given.y);
  vec4 s2_Given = vec4(s2Given.x, s2Given.y, s_Given.x, s_Given.y);
  vec4 s45Given = vec4(s4Given.x, s4Given.y, s5Given.x, s5Given.y);
  vec4 s67Given = vec4(s6Given.x, s6Given.y, s7Given.x, s7Given.y);

  s2_FWTFS.z = avgArc;
  s2_FWTFS.w = avgFlo;
  s2_Given.z = 0.0;
  s2_Given.w = 0.0;

  fragColor0 = s01FWTFS;
  fragColor1 = s2_FWTFS;
  fragColor2 = s01Given;
  fragColor3 = s2_Given;
  fragColor4 = s45FWTFS;
  fragColor5 = s67FWTFS;
  fragColor6 = s45Given;
  fragColor7 = s67Given;
}

void transferRun() {
  vec4 c01b = texture(texture0, vUV); // substance01b
  vec4 c2_b = texture(texture1, vUV); // substance2_b
  vec4 c45b = texture(texture6, vUV); // substance45b
  vec4 c67b = texture(texture7, vUV); // substance67b
  c2_b.z = 0.0;
  c2_b.w = 0.0;
  vec2 s0b = vec2(c01b.x, c01b.y);
  vec2 s1b = vec2(c01b.z, c01b.w);
  vec2 s2b = vec2(c2_b.x, c2_b.y);
  vec2 s_b = vec2(c2_b.z, c2_b.w);
  vec2 s4b = vec2(c45b.x, c45b.y);
  vec2 s5b = vec2(c45b.z, c45b.w);
  vec2 s6b = vec2(c67b.x, c67b.y);
  vec2 s7b = vec2(c67b.z, c67b.w);
  float s0bLen = length(s0b);
  float s1bLen = length(s1b);
  float s2bLen = length(s2b);
  float s_bLen = length(s_b);
  float s4bLen = length(s4b);
  float s5bLen = length(s5b);
  float s6bLen = length(s6b);
  float s7bLen = length(s7b);
  vec4 s012_bLen = vec4(s0bLen, s1bLen, s2bLen, s_bLen);
  vec4 s4567bLen = vec4(s4bLen, s5bLen, s6bLen, s7bLen);

  float s0Attraction = dot(s012_bLen, am0x012_) + dot(s4567bLen, am0x4567);
  float s1Attraction = dot(s012_bLen, am1x012_) + dot(s4567bLen, am1x4567);
  float s2Attraction = dot(s012_bLen, am2x012_) + dot(s4567bLen, am2x4567);
  float s_Attraction = dot(s012_bLen, am_x012_) + dot(s4567bLen, am_x4567);
  float s4Attraction = dot(s012_bLen, am4x012_) + dot(s4567bLen, am4x4567);
  float s5Attraction = dot(s012_bLen, am5x012_) + dot(s4567bLen, am5x4567);
  float s6Attraction = dot(s012_bLen, am6x012_) + dot(s4567bLen, am6x4567);
  float s7Attraction = dot(s012_bLen, am7x012_) + dot(s4567bLen, am7x4567);
  float sAttractionSum =
    sum(vec4(s0Attraction, s1Attraction, s2Attraction, s_Attraction)) +
    sum(vec4(s4Attraction, s5Attraction, s6Attraction, s7Attraction));
  s0Attraction = sAttractionSum == 0.0 ? 1.0 : s0Attraction / sAttractionSum;
  s1Attraction = sAttractionSum == 0.0 ? 1.0 : s1Attraction / sAttractionSum;
  s2Attraction = sAttractionSum == 0.0 ? 1.0 : s2Attraction / sAttractionSum;
  s_Attraction = sAttractionSum == 0.0 ? 1.0 : s_Attraction / sAttractionSum;
  s4Attraction = sAttractionSum == 0.0 ? 1.0 : s4Attraction / sAttractionSum;
  s5Attraction = sAttractionSum == 0.0 ? 1.0 : s5Attraction / sAttractionSum;
  s6Attraction = sAttractionSum == 0.0 ? 1.0 : s6Attraction / sAttractionSum;
  s7Attraction = sAttractionSum == 0.0 ? 1.0 : s7Attraction / sAttractionSum;

  float s0FloLen = 0.0;
  float s1FloLen = 0.0;
  float s2FloLen = 0.0;
  float s_FloLen = 0.0;
  float s4FloLen = 0.0;
  float s5FloLen = 0.0;
  float s6FloLen = 0.0;
  float s7FloLen = 0.0;
  vec2 s0FloDir = vec2(0.0, 0.0);
  vec2 s1FloDir = vec2(0.0, 0.0);
  vec2 s2FloDir = vec2(0.0, 0.0);
  vec2 s_FloDir = vec2(0.0, 0.0);
  vec2 s4FloDir = vec2(0.0, 0.0);
  vec2 s5FloDir = vec2(0.0, 0.0);
  vec2 s6FloDir = vec2(0.0, 0.0);
  vec2 s7FloDir = vec2(0.0, 0.0);

  vec4 prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  vec4 nextBound = getNextBound(prevBound);
  for (int i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    float loBound = prevBound.z;
    float hiBound = nextBound.z;
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    vec2 vvUV = vec2(vUV.x - prevBound.x / uSize, vUV.y - prevBound.y / uSize);
    vec4 c01a = texture(texture2, vvUV); // substance01a
    vec4 c2_a = texture(texture3, vvUV); // substance2_a
    vec4 c45a = texture(texture8, vvUV); // substance45a
    vec4 c67a = texture(texture9, vvUV); // substance67a
    vec2 cAvg = c2_a.zw;
    c2_a.z = 0.0;
    c2_a.w = 0.0;
    vec2 s0aFWTFS = vec2(c01a.x, c01a.y);
    vec2 s1aFWTFS = vec2(c01a.z, c01a.w);
    vec2 s2aFWTFS = vec2(c2_a.x, c2_a.y);
    vec2 s_aFWTFS = vec2(c2_a.z, c2_a.w);
    vec2 s4aFWTFS = vec2(c45a.x, c45a.y);
    vec2 s5aFWTFS = vec2(c45a.z, c45a.w);
    vec2 s6aFWTFS = vec2(c67a.x, c67a.y);
    vec2 s7aFWTFS = vec2(c67a.z, c67a.w);

    vec4 s012_Bisector = vec4(
      atan(s0aFWTFS.y, s0aFWTFS.x),
      atan(s1aFWTFS.y, s1aFWTFS.x),
      atan(s2aFWTFS.y, s2aFWTFS.x),
      atan(s_aFWTFS.y, s_aFWTFS.x)
    );
    vec4 s4567Bisector = vec4(
      atan(s4aFWTFS.y, s4aFWTFS.x),
      atan(s5aFWTFS.y, s5aFWTFS.x),
      atan(s6aFWTFS.y, s6aFWTFS.x),
      atan(s7aFWTFS.y, s7aFWTFS.x)
    );
    float avgArc = texture(texture6, vvUV).x; // avgArcAndFlo
    vec4 s012_aArc =
      avgArc == -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
    vec4 s4567aArc =
      avgArc == -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);

    vec4 s012_aLoBound = mod(((s012_Bisector - s012_aArc) + PI2), PI2);
    vec4 s4567aLoBound = mod(((s4567Bisector - s4567aArc) + PI2), PI2);
    vec4 s012_aHiBound = mod(((s012_Bisector + s012_aArc) + PI2), PI2);
    vec4 s4567aHiBound = mod(((s4567Bisector + s4567aArc) + PI2), PI2);
    s012_aHiBound = vec4(
      s012_aLoBound.x > s012_aHiBound.x ? s012_aHiBound.x + PI2 : s012_aHiBound.x,
      s012_aLoBound.y > s012_aHiBound.y ? s012_aHiBound.y + PI2 : s012_aHiBound.y,
      s012_aLoBound.z > s012_aHiBound.z ? s012_aHiBound.z + PI2 : s012_aHiBound.z,
      s012_aLoBound.w > s012_aHiBound.w ? s012_aHiBound.w + PI2 : s012_aHiBound.w
    );
    s4567aHiBound = vec4(
      s4567aLoBound.x > s4567aHiBound.x ? s4567aHiBound.x + PI2 : s4567aHiBound.x,
      s4567aLoBound.y > s4567aHiBound.y ? s4567aHiBound.y + PI2 : s4567aHiBound.y,
      s4567aLoBound.z > s4567aHiBound.z ? s4567aHiBound.z + PI2 : s4567aHiBound.z,
      s4567aLoBound.w > s4567aHiBound.w ? s4567aHiBound.w + PI2 : s4567aHiBound.w
    );

    vec2 s0TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.x, s012_aHiBound.x) * s0Attraction);
    vec2 s1TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.y, s012_aHiBound.y) * s1Attraction);
    vec2 s2TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.z, s012_aHiBound.z) * s2Attraction);
    vec2 s_TransferFraction = (arcOverlap(loBound, hiBound, s012_aLoBound.w, s012_aHiBound.w) * s_Attraction);
    vec2 s4TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.x, s4567aHiBound.x) * s4Attraction);
    vec2 s5TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.y, s4567aHiBound.y) * s5Attraction);
    vec2 s6TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.z, s4567aHiBound.z) * s6Attraction);
    vec2 s7TransferFraction = (arcOverlap(loBound, hiBound, s4567aLoBound.w, s4567aHiBound.w) * s7Attraction);

    vec2 s0FloFraction = divSafe(s0TransferFraction, length(s0aFWTFS), 0.0);
    vec2 s1FloFraction = divSafe(s1TransferFraction, length(s1aFWTFS), 0.0);
    vec2 s2FloFraction = divSafe(s2TransferFraction, length(s2aFWTFS), 0.0);
    vec2 s_FloFraction = divSafe(s_TransferFraction, length(s_aFWTFS), 0.0);
    vec2 s4FloFraction = divSafe(s4TransferFraction, length(s4aFWTFS), 0.0);
    vec2 s5FloFraction = divSafe(s5TransferFraction, length(s5aFWTFS), 0.0);
    vec2 s6FloFraction = divSafe(s6TransferFraction, length(s6aFWTFS), 0.0);
    vec2 s7FloFraction = divSafe(s7TransferFraction, length(s7aFWTFS), 0.0);

    s0FloDir = (s0FloDir + s0FloFraction);
    s1FloDir = (s1FloDir + s1FloFraction);
    s2FloDir = (s2FloDir + s2FloFraction);
    s_FloDir = (s_FloDir + s_FloFraction);
    s4FloDir = (s4FloDir + s4FloFraction);
    s5FloDir = (s5FloDir + s5FloFraction);
    s6FloDir = (s6FloDir + s6FloFraction);
    s7FloDir = (s7FloDir + s7FloFraction);

    s0FloLen = (s0FloLen + length(s0FloFraction));
    s1FloLen = (s1FloLen + length(s1FloFraction));
    s2FloLen = (s2FloLen + length(s2FloFraction));
    s_FloLen = (s_FloLen + length(s_FloFraction));
    s4FloLen = (s4FloLen + length(s4FloFraction));
    s5FloLen = (s5FloLen + length(s5FloFraction));
    s6FloLen = (s6FloLen + length(s6FloFraction));
    s7FloLen = (s7FloLen + length(s7FloFraction));

    if (hiBound > PI2) {
      break;
    }
  }

  vec4 c01Given = texture(texture4, vUV); // substance01Given
  vec4 c2_Given = texture(texture5, vUV); // substance2_Given
  vec4 c45Given = texture(texture10, vUV); // substance45Given
  vec4 c67Given = texture(texture11, vUV); // substance67Given
  vec2 s0Given = vec2(c01Given.x, c01Given.y);
  vec2 s1Given = vec2(c01Given.z, c01Given.w);
  vec2 s2Given = vec2(c2_Given.x, c2_Given.y);
  vec2 s_Given = vec2(c2_Given.z, c2_Given.w);
  vec2 s4Given = vec2(c45Given.x, c45Given.y);
  vec2 s5Given = vec2(c45Given.z, c45Given.w);
  vec2 s6Given = vec2(c67Given.x, c67Given.y);
  vec2 s7Given = vec2(c67Given.z, c67Given.w);

  vec2 s0Received = (normalizeSafe(s0FloDir) * s0FloLen);
  vec2 s1Received = (normalizeSafe(s1FloDir) * s1FloLen);
  vec2 s2Received = (normalizeSafe(s2FloDir) * s2FloLen);
  vec2 s_Received = (normalizeSafe(s_FloDir) * s_FloLen);
  vec2 s4Received = (normalizeSafe(s4FloDir) * s4FloLen);
  vec2 s5Received = (normalizeSafe(s5FloDir) * s5FloLen);
  vec2 s6Received = (normalizeSafe(s6FloDir) * s6FloLen);
  vec2 s7Received = (normalizeSafe(s7FloDir) * s7FloLen);

  float avgFlo = texture(texture3, vUV).w; // avgArcAndFlo
  vec4 s012_bFlo =
    avgFlo == -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  vec4 s4567bFlo =
    avgFlo == -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);

  vec2 s0Remaining = (s0b * (1.0 - s012_bFlo.x));
  vec2 s1Remaining = (s1b * (1.0 - s012_bFlo.y));
  vec2 s2Remaining = (s2b * (1.0 - s012_bFlo.z));
  vec2 s_Remaining = (s_b * (1.0 - s012_bFlo.w));
  vec2 s4Remaining = (s4b * (1.0 - s4567bFlo.x));
  vec2 s5Remaining = (s5b * (1.0 - s4567bFlo.y));
  vec2 s6Remaining = (s6b * (1.0 - s4567bFlo.z));
  vec2 s7Remaining = (s7b * (1.0 - s4567bFlo.w));

  vec2 s0 = (normalizeSafe(((s0Given + s0Received) + s0Remaining)) * (length(s0Received) + length(s0Remaining)));
  vec2 s1 = (normalizeSafe(((s1Given + s1Received) + s1Remaining)) * (length(s1Received) + length(s1Remaining)));
  vec2 s2 = (normalizeSafe(((s2Given + s2Received) + s2Remaining)) * (length(s2Received) + length(s2Remaining)));
  vec2 s_ = (normalizeSafe(((s_Given + s_Received) + s_Remaining)) * (length(s_Received) + length(s_Remaining)));
  vec2 s4 = (normalizeSafe(((s4Given + s4Received) + s4Remaining)) * (length(s4Received) + length(s4Remaining)));
  vec2 s5 = (normalizeSafe(((s5Given + s5Received) + s5Remaining)) * (length(s5Received) + length(s5Remaining)));
  vec2 s6 = (normalizeSafe(((s6Given + s6Received) + s6Remaining)) * (length(s6Received) + length(s6Remaining)));
  vec2 s7 = (normalizeSafe(((s7Given + s7Received) + s7Remaining)) * (length(s7Received) + length(s7Remaining)));

  vec4 s01 = vec4(s0.x, s0.y, s1.x, s1.y);
  vec4 s2_ = vec4(s2.x, s2.y, s_.x, s_.y);
  vec4 s45 = vec4(s4.x, s4.y, s5.x, s5.y);
  vec4 s67 = vec4(s6.x, s6.y, s7.x, s7.y);

  fragColor0 = s01;
  fragColor1 = s2_;
  fragColor2 = s45;
  fragColor3 = s67;
}

struct Reaction {
  vec4 input0;
  vec4 input1;
  vec4 input2;
  vec4 input3;
  vec4 output0;
  vec4 output1;
  vec4 output2;
  vec4 output3;
};
Reaction reactions[] = Reaction[](
  /* insert-start:reactions */
  Reaction(
    vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0)
  )
  /* insert-end:reactions */
);
void substanceReact() {
  vec4 cs01 = texture(texture0, vUV); // substance01
  vec4 cs23 = texture(texture1, vUV); // substance23
  vec4 cs45 = texture(texture4, vUV); // substance45
  vec4 cs67 = texture(texture5, vUV); // substance67
  vec4 ca0123 = texture(texture2, vUV); // address0123
  vec4 ca4567 = texture(texture3, vUV); // address4567
  vec4 initial0 = vec4(
    length(vec2(cs01.x, cs01.y)),
    length(vec2(cs01.z, cs01.w)),
    length(vec2(cs23.x, cs23.y)),
    length(vec2(cs23.z, cs23.w))
  );
  vec4 initial1 = vec4(
    length(vec2(cs45.x, cs45.y)),
    length(vec2(cs45.z, cs45.w)),
    length(vec2(cs67.x, cs67.y)),
    length(vec2(cs67.z, cs67.w))
  );
  vec4 initial2 = vec4(max(ca0123.x, 0.0), max(ca0123.y, 0.0), max(ca0123.z, 0.0), max(ca0123.w, 0.0));
  vec4 initial3 = vec4(max(ca4567.x, 0.0), max(ca4567.y, 0.0), max(ca4567.z, 0.0), max(ca4567.w, 0.0));

  vec4 input0 = initial0;
  vec4 input1 = initial1;
  vec4 input2 = initial2;
  vec4 input3 = initial3;
  vec4 output0 = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 output1 = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 output2 = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 output3 = vec4(0.0, 0.0, 0.0, 0.0);

  float rWeights[] = float[](
    /* insert-start:reactionWeights */
    1.0
    /* insert-end:reactionWeights */
  );

  for (int i = 0; i < 16; i++) {
    vec4 i0 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i1 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i2 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i3 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 o0 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 o1 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 o2 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 o3 = vec4(0.0, 0.0, 0.0, 0.0);

    for (int j = 0; j < /* insert-start:reactionCount */ 1 /* insert-end:reactionCount */; j++) {
      Reaction r = reactions[j];
      float rWeight = rWeights[j];
      if (
        // if the output of a reaction is an address, and the current grid cell is that address, skip the reaction
        dot(initial2, r.output2) == 0.0 &&
        dot(initial3, r.output3) == 0.0
      ) {
        vec4 iaVec = min(
          min(divSafe(input0, r.input0, bigilon), divSafe(input1, r.input1, bigilon)),
          min(divSafe(input2, r.input2, bigilon), divSafe(input3, r.input3, bigilon))
        );
        float inputAvailability = min(min(iaVec.x, iaVec.y), min(iaVec.z, iaVec.w));
        float reactionSpeed = inputAvailability * rWeight;
        i0 = (i0 + (r.input0 * reactionSpeed));
        i1 = (i1 + (r.input1 * reactionSpeed));
        i2 = (i2 + (r.input2 * reactionSpeed));
        i3 = (i3 + (r.input3 * reactionSpeed));
        o0 = (o0 + (r.output0 * reactionSpeed));
        o1 = (o1 + (r.output1 * reactionSpeed));
        o2 = (o2 + (r.output2 * reactionSpeed));
        o3 = (o3 + (r.output3 * reactionSpeed));
      }
    }
    vec4 scalebackVec = max(
      max(divSafe(input0, i0, 0.0), divSafe(input1, i1, 0.0)),
      max(divSafe(input2, i2, 0.0), divSafe(input3, i3, 0.0))
    );
    float scaleback = min(
      max(max(scalebackVec.x, scalebackVec.y), max(scalebackVec.z, scalebackVec.w)),
      1.0
    );
    input0 = (input0 - (i0 * scaleback));
    input1 = (input1 - (i1 * scaleback));
    input2 = (input2 - (i2 * scaleback));
    input3 = (input3 - (i3 * scaleback));
    output0 = (output0 + (o0 * scaleback));
    output1 = (output1 + (o1 * scaleback));
    output2 = (output2 + (o2 * scaleback));
    output3 = (output3 + (o3 * scaleback));
    if (scaleback == 1.0 || scaleback < epsilon) {
      break;
    }
  }
  vec4 final0 = max((input0 + output0), 0.0);
  vec4 final1 = max((input1 + output1), 0.0);

  vec4 s0123X = vec4(cs01.x, cs01.z, cs23.x, cs23.z);
  vec4 s4567X = vec4(cs45.x, cs45.z, cs67.x, cs67.z);
  vec4 s0123Y = vec4(cs01.y, cs01.w, cs23.y, cs23.w);
  vec4 s4567Y = vec4(cs45.y, cs45.w, cs67.y, cs67.w);
  vec2 avgDir = normalizeSafe(
    vec2(
      dot(s0123X, uDirWeight012_) + dot(s4567X, uDirWeight4567),
      dot(s0123Y, uDirWeight012_) + dot(s4567Y, uDirWeight4567)
    )
  );

  vec2 s0 = (normalizeSafe(mix(avgDir, vec2(cs01.x, cs01.y), epsilon)) * final0.x);
  vec2 s1 = (normalizeSafe(mix(avgDir, vec2(cs01.z, cs01.w), epsilon)) * final0.y);
  vec2 s2 = (normalizeSafe(mix(avgDir, vec2(cs23.x, cs23.y), epsilon)) * final0.z);
  vec2 s3 = (normalizeSafe(mix(avgDir, vec2(cs23.z, cs23.w), epsilon)) * final0.w);
  vec2 s4 = (normalizeSafe(mix(avgDir, vec2(cs45.x, cs45.y), epsilon)) * final1.x);
  vec2 s5 = (normalizeSafe(mix(avgDir, vec2(cs45.z, cs45.w), epsilon)) * final1.y);
  vec2 s6 = (normalizeSafe(mix(avgDir, vec2(cs67.x, cs67.y), epsilon)) * final1.z);
  vec2 s7 = (normalizeSafe(mix(avgDir, vec2(cs67.z, cs67.w), epsilon)) * final1.w);
  float a0 = initial2.x > 0.0 ? max(input2.x, epsilon) : -output2.x;
  float a1 = initial2.y > 0.0 ? max(input2.y, epsilon) : -output2.y;
  float a2 = initial2.z > 0.0 ? max(input2.z, epsilon) : -output2.z;
  float a3 = initial2.w > 0.0 ? max(input2.w, epsilon) : -output2.w;
  float a4 = initial3.x > 0.0 ? max(input3.x, epsilon) : -output3.x;
  float a5 = initial3.y > 0.0 ? max(input3.y, epsilon) : -output3.y;
  float a6 = initial3.z > 0.0 ? max(input3.z, epsilon) : -output3.z;
  float a7 = initial3.w > 0.0 ? max(input3.w, epsilon) : -output3.w;

  fragColor0 = vec4(s0.x, s0.y, s1.x, s1.y);
  fragColor1 = vec4(s2.x, s2.y, s3.x, s3.y);
  fragColor2 = vec4(a0, a1, a2, a3);
  fragColor3 = vec4(a4, a5, a6, a7);
  fragColor4 = vec4(s4.x, s4.y, s5.x, s5.y);
  fragColor5 = vec4(s6.x, s6.y, s7.x, s7.y);
}

void addressPrepare() {
  vec4 ca0123 = texture(texture0, vUV); // address0123
  vec4 ca4567 = texture(texture1, vUV); // address4567
  fragColor0 = max((ca0123 * -1.0), 0.0);
  fragColor1 = max((ca4567 * -1.0), 0.0);
}

void addressRun() {
  vec4 ca0123 = texture(texture0, vUV); // address0123
  vec4 ca4567 = texture(texture1, vUV); // address4567
  vec4 cat0123 = texture(texture2, vUV); // addressTotal0123
  vec4 cat4567 = texture(texture3, vUV); // addressTotal4567

  fragColor0 = vec4(
    ca0123.x > 0.0 ? ca0123.x + cat0123.x : ca0123.x,
    ca0123.y > 0.0 ? ca0123.y + cat0123.y : ca0123.y,
    ca0123.z > 0.0 ? ca0123.z + cat0123.z : ca0123.z,
    ca0123.w > 0.0 ? ca0123.w + cat0123.w : ca0123.w
  );
  fragColor1 = vec4(
    ca4567.x > 0.0 ? ca4567.x + cat4567.x : ca4567.x,
    ca4567.y > 0.0 ? ca4567.y + cat4567.y : ca4567.y,
    ca4567.z > 0.0 ? ca4567.z + cat4567.z : ca4567.z,
    ca4567.w > 0.0 ? ca4567.w + cat4567.w : ca4567.w
  );
}

void main() {
  /* insert:main */
}
