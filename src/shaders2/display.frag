#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture0; // s01
uniform sampler2D texture1; // s23
uniform sampler2D texture2; // s01Prev
uniform sampler2D texture3; // s23Prev
uniform sampler2D texture4; // s01Given
uniform sampler2D texture5; // s23Given
uniform sampler2D texture6; // a0123
uniform sampler2D texture7; // a4567
uniform sampler2D texture8; // s45
uniform sampler2D texture9; // s67
uniform sampler2D texture10; // s45Prev
uniform sampler2D texture11; // s67Prev
uniform sampler2D texture12; // s45Given
uniform sampler2D texture13; // s67Given
layout(std140) uniform StaticUniforms {
  float uSize;
  float uTransferRadius;
};
layout(std140) uniform SubstanceUniforms {
  vec4 uArc0123;
  vec4 uArcWeight0123;
  vec4 uArcBlending0123;
  vec4 uFlo0123;
  vec4 uFloWeight0123;
  vec4 uFloBlending0123;
  vec4 uDirWeight0123;
  vec4 uDirBlending0123;
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
  vec4 am0x0123;
  vec4 am1x0123;
  vec4 am2x0123;
  vec4 am3x0123;
  vec4 am4x0123;
  vec4 am5x0123;
  vec4 am6x0123;
  vec4 am7x0123;
  vec4 am0x4567;
  vec4 am1x4567;
  vec4 am2x4567;
  vec4 am3x4567;
  vec4 am4x4567;
  vec4 am5x4567;
  vec4 am6x4567;
  vec4 am7x4567;
};
out vec4 fragColor;

float PI = 3.141592653589793;
float PI2 = 6.283185307179586;
float epsilon = 0.000000001;
float bigilon = 999999999.9;

vec4 sumVec = vec4(1.0, 1.0, 1.0, 1.0);
float sum(in vec4 x) {
  return dot(x, sumVec);
}

float brightness = -1.0;
float contrast = 3.0;

float sigmoid(in float x) {
  x = (x + brightness) * contrast;
  float zeroPoint = 0.5;
  return zeroPoint / (zeroPoint + pow(2.0, -x));
}

float halfSigmoid(in float x) {
  x = (x + brightness) * contrast;
  return max(2.0 / (1.0 + pow(2.0, -x)) - 1.0, 0.0);
}

float linear(in float x) {
  x = (x + brightness) * contrast;
  return max(x, 0.0);
}

vec4 overlay(in vec4 a, in vec4 b) {
  return vec4(mix(b.xyz, a.xyz, a.w), 1.0 - (1.0 - a.w) * (1.0 - b.w));
}

vec3 duotone(in vec3 a, in vec3 b, in float m) {
  vec3 grey = vec3(0.5, 0.5, 0.5);
  return m < 0.5 ? mix(b, grey, m * 2.0) : mix(grey, a, m * 2.0 - 1.0);
}

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

void main() {
  vec4 c01 = texture(texture0, vUV); // substance01
  vec4 c23 = texture(texture1, vUV); // substance23
  vec4 a0123 = texture(texture6, vUV); // address0123
  vec4 c45 = texture(texture8, vUV); // substance45
  vec4 c67 = texture(texture9, vUV); // substance67
  vec2 s0 = vec2(c01.x, c01.y);
  vec2 s1 = vec2(c01.z, c01.w);
  vec2 s2 = vec2(c23.x, c23.y);
  vec2 s4 = vec2(c45.x, c45.y);
  vec2 s5 = vec2(c45.z, c45.w);
  vec2 s6 = vec2(c67.x, c67.y);
  vec2 s7 = vec2(c67.z, c67.w);

  if (length(s2) > 0.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // vec4 f0 = vec4(hsl2rgb(vec3(0.000, 1.0, 0.5)), softClamp(length(s0)));
  // vec4 f1 = vec4(hsl2rgb(vec3(0.166, 1.0, 0.5)), softClamp(length(s1)));
  // vec4 f2 = vec4(hsl2rgb(vec3(0.333, 1.0, 0.5)), softClamp(length(s2)));
  // vec4 f4 = vec4(hsl2rgb(vec3(0.500, 1.0, 0.5)), softClamp(length(s4)));
  // vec4 f5 = vec4(hsl2rgb(vec3(0.666, 1.0, 0.5)), softClamp(length(s5)));
  // vec4 f6 = vec4(hsl2rgb(vec3(0.833, 1.0, 0.5)), softClamp(length(s6)));

  fragColor = vec4(duotone(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), length(s0)), 1.0);
  // fragColor = colorScale(sigmoid(length(s0)));

  // fragColor = overlay(overlay(overlay(overlay(overlay(overlay(f0, f1), f2), f4), f5), f6), vec4(0.0, 0.0, 0.0, 1.0));
  // fragColor = colorScale(flatten(length(s0)));

  // float e =
  //   sum(vec4(length(s0), length(s1), length(s2), length(s3))) +
  //   sum(vec4(length(s4), length(s5), length(s6), length(s7)));

  // fragColor = colorScale(flatten(e));
}
