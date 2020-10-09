#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D tex;

out vec4 fragColor;
void main() {
  vec4 col = texture(tex, vUV);
  fragColor = vec4(
    max(-col.x, 0.) + max(-col.y, 0.),
    max(col.x, 0.) + max(col.y, 0.),
    max(-col.x, 0.) + max(col.y, 0.),
    1.0
  );
}
