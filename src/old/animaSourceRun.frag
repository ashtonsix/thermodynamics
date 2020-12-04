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
};

float mag(in vec2 e) {
  return abs(e.x) + abs(e.y);
}
float mag(in vec4 e) {
  return abs(e.x) + abs(e.y);
}
vec2 add(in vec2 c, in float m) {
  m = mag(c) + m;
  float theta = atan(c.y, c.x);
  float ye = (sin(theta) / (abs(sin(theta)) + abs(cos(theta)))) * m;
  float xe = (cos(theta) / (abs(sin(theta)) + abs(cos(theta)))) * m;
  return vec2(xe, ye);
}

layout(location=0) out vec4 fragColor1;
layout(location=1) out vec4 fragColor2;
layout(location=2) out vec4 fragColor3;
void main() {
  vec4 c1 = texture(texture1, vUV);
  vec4 c2 = texture(texture2, vUV);

  if (c2.x >= 0.) {
    fragColor1 = c1;
    fragColor2 = c2;
    return;
  }

  vec4 c3 = texture(texture3, vec2(0., 0.));

  float anima = abs(c2.x) + c3.x;

  vec2 e = add(c1.xy, anima * .01);

  fragColor1 = vec4(e, c1.zw);
  fragColor2 = vec4(-anima * .99, 0., 0., 0.);
}
