#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;
layout(std140) uniform SceneUniforms {
  float uWidth;
  float uHeight;
  float centripetalFactor;
  float centripetalAngle;
  float smallArc;
};

float PI = 3.141592653589793;

float displace_i2j[9] = float[](4., 5., 6., 3., -1., 7., 2., 1., 0.);
float displace_i2Bound(in float i) {
  return (
    smallArc * (1. / 2.) +
    smallArc * floor(i / 2.) +
    (PI / 2. - smallArc) * floor((i + 1.) / 2.)
  );
}

vec2 getDisplace(in vec2 e, in int i, in float arcFull) {
  float j = float(displace_i2j[i]);
  
  float loBound = displace_i2Bound(j);
  float hiBound =  displace_i2Bound(j + 1.);
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
  float vmag = 0.;
  vec2 vxy = vec2(0., 0.);

  vec4 c = texture(texture1, vUV);
  if (c.w == -1.) {
    fragColor1 = vec4(0., 0., 0., c.w);
    fragColor2 = vec4(0., 0., 0., 0.);
    return;
  }

  for (int i = 0; i < 9; i++) {
    if (i == 4) continue;
    vec2 ixy = vec2(mod(float(i), 3.) - 1., floor(float(i) / 3.) - 1.);
    vec4 cc = texture(
      texture1,
      vec2(
        vUV.x + ixy.x / uWidth,
        vUV.y + ixy.y / uHeight
      )
    );
    // adjusted centripetal factor
    float acf = min(cc.z / mag(cc) * centripetalFactor, min(centripetalFactor, 1.));
    acf = isnan(acf) || isinf(acf) ? 0. : acf;

    if (cc.w > 0.) {
      vec2 e = ixy * -(cc.w / mag(ixy)) * (1. - acf);
      vxy += e;
      vmag += (abs(e.x) + abs(e.y));
    }

    int j = (int(-ixy.y) + 1) * 3 + int(-ixy.x) + 1;
    vec2 e1 = getDisplace(cc.xy, j, PI - centripetalAngle) * (1. - acf);
    float me2 = mag(getDisplace(c.xy, j, centripetalAngle) * (mag(cc) / cc.z) * acf);
    me2 = isnan(me2) || isinf(me2) ? 0. : me2;

    vxy += e1;
    vmag += mag(e1) + me2;
  }
  
  vxy = (c.xy + vxy) * .5;
  vmag = (vmag + mag(c)) * .5;

  if (mag(vxy) == 0.) vxy += 0.000001;

  float mult = vmag / mag(vxy);
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor1 = vec4(
    vxy * mult,
    0.,
    0.
  );
  fragColor2 = vec4(0., 0., 0., 0.);
}
