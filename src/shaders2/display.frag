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

float flatten(in float x) {
  float brightness = -1.0;
  float contrast = 2.0;
  float zeroPoint = 0.5;
  return zeroPoint / (zeroPoint + pow(2.0, -((x + brightness) * contrast)));
}

vec3 hsl2rgb(in vec3 c) {
  vec3 rgb = clamp(
    abs(
      mod(
        c.x * 6.0 + vec3(0.0, 4.0, 2.0),
        6.0
      ) - 3.0
    ) - 1.0,
    0.0,
    1.0
  );
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
  vec4 c01 = texture(texture0, vUV); // substance01
  vec4 c23 = texture(texture1, vUV); // substance23
  vec4 c45 = texture(texture3, vUV); // substance45
  vec4 c67 = texture(texture4, vUV); // substance67
  vec2 s0 = vec2(c01.x, c01.y);
  vec2 s1 = vec2(c01.z, c01.w);
  vec2 s2 = vec2(c23.x, c23.y);
  vec2 s3 = vec2(c23.z, c23.w);
  vec2 s4 = vec2(c45.x, c45.y);
  vec2 s5 = vec2(c45.z, c45.w);
  vec2 s6 = vec2(c67.x, c67.y);
  vec2 s7 = vec2(c67.z, c67.w);

  float e =
    sum(vec4(length(s0), length(s1), length(s2), length(s3))) +
    sum(vec4(length(s4), length(s5), length(s6), length(s7)));

  fragColor = vec4(hsl2rgb(vec3(0.0, 0.0, flatten(e))), 1.0);
}
