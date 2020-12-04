#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
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

layout(location=0) out vec4 fragColor1;
void main() {
  vec4 c = texture(texture1, vUV);
    
  fragColor1 = c;
}
