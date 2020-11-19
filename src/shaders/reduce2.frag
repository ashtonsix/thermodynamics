#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
layout(std140) uniform SceneUniforms {
  float uSize;
};

layout(location=0) out vec4 fragColor1;
void main() {
  vec4 total = vec4(0., 0., 0., 0.);
  for (float y = 0.; y < 1.; y += 1. / uSize) {
    total += texture(texture1, vec2(0., y));
  }

  fragColor1 = total;
}
