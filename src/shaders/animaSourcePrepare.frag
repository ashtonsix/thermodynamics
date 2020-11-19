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

float mag(in vec2 e) {
  return abs(e.x) + abs(e.y);
}
float mag(in vec4 e) {
  return abs(e.x) + abs(e.y);
}

int getAnimaType(in float magnitude, in float anima) {
  if (anima == 0.) return 0; // none
  if (anima < 0.) return 1; // source
  if (anima / magnitude < .99) return 2; // destination
  return 3; // transit
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
  vec4 c = texture(texture1, vUV);
  vec4 c2 = texture(texture2, vUV);
    
  if (getAnimaType(mag(c), c2.x) != 2) {
    fragColor1 = c;
    fragColor2 = c2;
    fragColor3 = vec4(0., 0., 0., 0.);
    return;
  }

  float transfer = min(mag(c.xy) * .05, c2.x * .1);
  float consumed = min(c2.x * .05, transfer);

  fragColor1 = vec4(add(c.xy, -transfer), c.zw);
  fragColor2 = vec4(c2.x - consumed, c2.yzw);
  fragColor3 = vec4(transfer, 0., 0., 0.);
}
