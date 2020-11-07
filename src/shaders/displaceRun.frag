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

float tf = .5;

layout(location=0) out vec4 fragColor1;
layout(location=1) out vec4 fragColor2;
void main() {
  float dmag = 0.;
  float vmag = 0.;
  vec2 vxy = vec2(0., 0.);

  vec4 c = texture(texture1, vUV);
  vec4 c2 = texture(texture2, vUV);
  if (c.w == -1.) {
    fragColor1 = vec4(0., 0., 0., c.w);
    fragColor2 = vec4(0., 0., 0., 0.);
    return;
  }
  // float dfrac = c2.x / mag(c);
  // dfrac = isnan(dfrac) || isinf(dfrac) ? 0. : min(dfrac, 1.);
  // float tf = mix(transferFractionRegular, transferFractionAnima, dfrac);

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

    vec2 ixy = prevBound.xy * -1.;
    vec4 cc = texture(
      texture1,
      vec2(
        vUV.x + ixy.x / uSize,
        vUV.y + ixy.y / uSize
      )
    );
    vec4 cc2 = texture(
      texture2,
      vec2(
        vUV.x + ixy.x / uSize,
        vUV.y + ixy.y / uSize
      )
    );
    // adjusted centripetal factor
    float acf = min(cc.z / mag(cc) * centripetalFactor, min(centripetalFactor, 1.));
    acf = isnan(acf) || isinf(acf) ? 0. : acf;

    float dfrac = cc2.x / mag(cc);
    dfrac = isnan(dfrac) || isinf(dfrac) ? 0. : dfrac;

    if (cc.w > 0.) {
      vec2 e = ixy * -(cc.w / mag(ixy)) * (1. - acf);
      vxy += e;
      vmag += (abs(e.x) + abs(e.y));
      dmag += (abs(e.x) + abs(e.y)) * dfrac;
    }

    vec2 e1 = getDisplace(cc.xy, loBound, hiBound, PI - centripetalAngle) * (1. - acf);
    float me2 = mag(getDisplace(c.xy, loBound, hiBound, centripetalAngle) * (mag(cc) / cc.z) * acf);
    me2 = isnan(me2) || isinf(me2) ? 0. : me2;

    vxy += e1;
    vmag += mag(e1) + me2;
    dmag += (mag(e1) + me2) * dfrac;

    if (hiBound > 2. * PI) {
      break;
    }
  }
  
  vxy = c.xy * (1. - tf) + vxy * tf;
  vmag = mag(c) * (1. - tf) + vmag * tf;
  dmag = c2.x * (1. - tf) + dmag * tf;

  if (mag(vxy) == 0.) vxy += 0.000001;

  float mult = vmag / mag(vxy);
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor1 = vec4(
    vxy * mult,
    0.,
    0.
  );
  fragColor2 = vec4(
    dmag,
    0.,
    0.,
    0.
  );
}
