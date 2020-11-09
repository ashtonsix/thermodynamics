#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;
layout(std140) uniform SceneUniforms {
  float uSize;
  float centripetalFactor;
  float centripetalAngle;
  float transferRadius;
  float transferFractionRegular;
  float transferFractionAnima;
};

float PI = 3.141592653589793;

vec4 getNextBound(in vec4 bound) {
  float ix = bound.x;
  float iy = bound.y;
  float it = bound.z;
  float radius = bound.w;
  float ox = 0.;
  float oy = 0.;
  float ot = 7.;
  if (it < PI && abs(ix - .5) < radius) {
    float x = ix - .5;
    float y = pow(pow(radius, 2.) - pow(x, 2.), .5);
    float t = atan(y, x);
    if (t < 0.) t += 2. * PI;
    if (t < ot) {;
      ox = ix - 1.;
      oy = iy;
      ot = t;
    }
  }
  if ((it <= PI * .5 || it >= PI * 1.5) && abs(iy + .5) < radius) {
    float y = iy + .5;
    float x = pow(pow(radius, 2.) - pow(y, 2.), .5);
    float t = atan(y, x);
    if (t < 0.) t += 2. * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.;
      ot = t;
    }
  }
  if (it >= PI && abs(ix + .5) < radius) {
    float x = ix + .5;
    float y = -(pow(pow(radius, 2.) - pow(x, 2.), .5));
    float t = atan(y, x);
    if (t < 0.) t += 2. * PI;
    if (t < ot) {;
      ox = ix + 1.;
      oy = iy;
      ot = t;
    }
  }
  if (it > PI * .5 && it < PI * 1.5 && abs(iy - .5) < radius) {
    float y = iy - .5;
    float x = -(pow(pow(radius, 2.) - pow(y, 2.), .5));
    float t = atan(y, x);
    if (t < 0.) t += 2. * PI;
    if (t < ot) {
      ox = ix;
      oy = iy - 1.;
      ot = t;
    }
  }
  return vec4(ox, oy, ot, radius);
}

vec2 getDisplace(in vec2 e, in float loBound, in float hiBound, in float arcFull) {
  float bisector = atan(e.y, e.x);

  float loUnbounded = mod(bisector - arcFull + PI * 2., PI * 2.);
  float hiUnbounded = mod(bisector + arcFull + PI * 2., PI * 2.);
  if (loUnbounded > hiUnbounded) hiUnbounded += PI * 2.;
  if (hiBound < loUnbounded) {
    loUnbounded -= PI * 2.;
    hiUnbounded -= PI * 2.;
  } else if (loBound > hiUnbounded) {
    loUnbounded += PI * 2.;
    hiUnbounded += PI * 2.;
  }
  float lo = max(min(loUnbounded, hiBound), loBound);
  float hi = max(min(hiUnbounded, hiBound), loBound);
  float theta = (lo + hi) / 2.;
  float arc = hi - lo;
  if (theta >= PI) theta -= PI * 2.;

  float scalar =
    ((abs(e.x) + abs(e.y)) * (arc / (arcFull * 2.))) /
    (abs(cos(theta)) + abs(sin(theta)));

  return vec2(cos(theta), sin(theta)) * scalar;
}

float mag(in vec2 e) {
  return abs(e.x) + abs(e.y);
}
float mag(in vec4 e) {
  return abs(e.x) + abs(e.y);
}

layout(location=0) out vec4 fragColor1;
layout(location=1) out vec4 fragColor2;
void main() {
  float centripetalMag = 0.;
  float wallMag = 0.;
  float notWallCount = 0.;

  vec4 c = texture(
    texture1,
    vUV
  );
  if (c.w == -1.) {
    fragColor1 = vec4(0., 0., 0., c.w);
    fragColor2 = vec4(0., 0., 0., 0.);
    return;
  }

  vec4 prevBound = vec4(round(transferRadius), 0., 0., transferRadius);
  vec4 nextBound = getNextBound(prevBound);
  while (true) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    float loBound = prevBound.z;
    float hiBound = nextBound.z;
    if (loBound > hiBound) {
      hiBound += 2. * PI;
    } else if (hiBound - loBound < .0001) {
      continue;
    }

    float cx = prevBound.x;
    float cy = prevBound.y;
    vec4 cc = texture(
      texture1,
      vec2(
        vUV.x + cx / uSize,
        vUV.y + cy / uSize
      )
    );
    
    if (cc.w == -1.) {
      vec2 e = getDisplace(c.xy, loBound, hiBound, PI - centripetalAngle);
      wallMag += mag(e);
    } else {
      vec2 e = getDisplace(cc.xy, loBound, hiBound, centripetalAngle);
      centripetalMag += mag(e);
      notWallCount += 1.;
    }

    if (hiBound > 2. * PI) {
      break;
    }
  }

  float wEnergy = wallMag / notWallCount;
  if (isinf(wEnergy) || isnan(wEnergy)) wEnergy = 0.;
  fragColor1 = vec4(c.x, c.y, centripetalMag, wEnergy);
  fragColor2 = texture(
    texture2,
    vUV
  );
}
