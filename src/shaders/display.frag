#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
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
  float brightness;
  float contrast;
};

float PI = 3.141592653589793;

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(
      abs(
        mod(
          c.x * 6. + vec3(0., 4., 2.),
          6.
        ) - 3.
      ) - 1.,
      0.,
      1.
    );
    return c.z + c.y * (rgb - .5) * (1. - abs(2. * c.z - 1.));
}

float mag(in vec2 e) {
  return abs(e.x) + abs(e.y);
}
float mag(in vec4 e) {
  return abs(e.x) + abs(e.y);
}

float scale(in float x) {
  float zeroPoint = .5;
  return zeroPoint / (zeroPoint + pow(2., -((x + brightness) * contrast)));
}

vec4 colorScale(in float x) {
  return vec4(
    hsl2rgb(
      mix(
        vec3(1.6, 1., 0.),
        vec3( .8, 1., 1.),
        x
      )
    ),
    1.
  );
}

int getAnimaType(in float magnitude, in float anima) {
  if (anima == 0.) return 0; // none
  if (anima < 0.) return 1; // source
  if (anima / magnitude < .99) return 2; // destination
  return 3; // transit
}

vec4 displayMode_intensity(in vec2 vUV, in vec4 c) {
  float intensity = scale(mag(c));

  return colorScale(intensity);
}
vec4 displayMode_intensityWithAnima(in vec2 vUV, in vec4 c) {
  vec4 c2 = texture(texture3, vUV);

  float intensity = scale(mag(c));
  float afrac = abs(c2.x) / mag(c);
  afrac = (isnan(afrac) || isinf(afrac)) ? 0. : min(afrac, 1.);

  return vec4(
    hsl2rgb(vec3(float(getAnimaType(mag(c), c2.x)) / 4., afrac, intensity * .7)),
    1.
  );
}
vec4 displayMode_intensityRelative(in vec2 vUV, in vec4 c) {
  float x = mag(c) /
  ((
    mag(texture(texture1, vec2(vUV.x + 1. / uSize, vUV.y))) +
    mag(texture(texture1, vec2(vUV.x - 1. / uSize, vUV.y))) +
    mag(texture(texture1, vec2(vUV.x, vUV.y + 1. / uSize))) +
    mag(texture(texture1, vec2(vUV.x, vUV.y - 1. / uSize)))
  ) / 4.);

  float intensity = scale(x);

  return colorScale(intensity);
}
vec4 displayMode_difference(in vec2 vUV, in vec4 c) {
  vec4 c2 = texture(texture2, vUV);
  float m = abs(mag(c) - mag(c2));

  float intensity = scale(m * 50.);

  return colorScale(intensity);
}
vec4 displayMode_theta(in vec2 vUV, in vec4 c) {
  float intensity = scale(mag(c));

  return vec4(
    hsl2rgb(vec3(
      ((c.x == 0. ? sign(c.y) * PI / 2. : atan(c.y, c.x)) + PI) / (2. * PI),
      1.,
      intensity * .7
    )),
    1.
  );
}
vec4 displayMode_centripetal(in vec2 vUV, in vec4 c) {
  float cf = c.z / mag(c);
  if (cf <= 1.) cf = 1. / cf;
  float intensity = scale(.1 * cf);

  return colorScale(intensity);
}


out vec4 fragColor;
void main() {
  vec4 cPrimary = texture(texture1, vUV);
  if (cPrimary.w == -1.) {
    fragColor = vec4(
      0.,
      0.,
      0.,
      0.
    );
    return;
  }

  if (displayMode == 1.) {
    fragColor = displayMode_intensity(vUV, cPrimary);
  } else if (displayMode == 2.) {
    fragColor = displayMode_intensityWithAnima(vUV, cPrimary);
  } else if (displayMode == 3.) {
    fragColor = displayMode_theta(vUV, cPrimary);
  } else if (displayMode == 4.) {
    fragColor = displayMode_centripetal(vUV, cPrimary);
  } else if (displayMode == 5.) {
    fragColor = displayMode_difference(vUV, cPrimary);
  } else {
    fragColor = vec4(0., 0., 0., 0.);
  }
}
