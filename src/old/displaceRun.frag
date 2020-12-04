#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;
layout(std140) uniform SceneUniforms {
  float uSize;
  float centripetalFactorX;
  float centripetalFactorY;
  float transferAngleRegular;
  float transferAngleCentripetal;
  float transferRadius;
  float transferFractionRegular;
  float transferFractionAnima;
  float displayMode;
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

int getAnimaType(in float magnitude, in float anima) {
  if (anima == 0.) return 0; // none
  if (anima < 0.) return 1; // source
  if (anima / magnitude < .99) return 2; // destination
  return 3; // transit
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
  float amag = 0.;
  float vmag = 0.;
  vec2 vxy = vec2(0., 0.);

  vec4 c = texture(texture1, vUV);
  vec4 c2 = texture(texture2, vUV);
  if (c.w == -1.) {
    fragColor1 = vec4(0., 0., 0., c.w);
    fragColor2 = vec4(0., 0., 0., 0.);
    return;
  }

  vec4 prevBound = vec4(round(transferRadius), 0., 0., transferRadius);
  vec4 nextBound = getNextBound(prevBound);
  for (int i; i < 999; i++) {
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
    
    int atype = getAnimaType(mag(cc), cc2.x);
    float afrac = abs(cc2.x) / mag(cc);
    afrac = (isnan(afrac) || isinf(afrac)) ? 0. : min(abs(afrac), 1.);
    float ttf = (atype == 0 || atype == 2) ? transferFractionRegular : transferFractionAnima;

    float cf = min(cc.z / mag(cc) / centripetalFactorX, 1.) * centripetalFactorY;
    cf = (isnan(cf) || isinf(cf)) ? 0. : cf;

    if (cc.w > 0.) {
      vec2 e = ixy * -(cc.w / mag(ixy)) * (1. - cf) * ttf;
      vxy += e;
      vmag += (abs(e.x) + abs(e.y));
      amag += (abs(e.x) + abs(e.y)) * afrac;
    }

    vec2 e1 = getDisplace(cc.xy, loBound, hiBound, transferAngleRegular) * (1. - cf) * ttf;
    float me2 = mag(getDisplace(c.xy, loBound, hiBound, transferAngleCentripetal) * (mag(cc) / cc.z) * cf) * ttf;
    me2 = (isnan(me2) || isinf(me2)) ? 0. : me2;

    vxy += e1;
    vmag += mag(e1) + me2;
    amag += (mag(e1) + me2) * afrac;

    if (hiBound > 2. * PI) {
      break;
    }
  }

  int atype = getAnimaType(mag(c), c2.x);
  float tf = (atype == 0 || atype == 2) ? transferFractionRegular : transferFractionAnima;
  
  vxy = c.xy * (1. - tf) + vxy;
  vmag = mag(c) * (1. - tf) + vmag;
  amag = atype == 1 ? c2.x : (c2.x * (1. - tf) + amag) * .99999;

  if (mag(vxy) == 0.) vxy += 0.000001;

  float mult = vmag / mag(vxy);
  mult = (isnan(mult) || isinf(mult)) ? 1. : mult;

  fragColor1 = vec4(
    vxy * mult,
    c.z,
    0.
  );
  fragColor2 = vec4(
    amag,
    c2.yzw
  );
}
