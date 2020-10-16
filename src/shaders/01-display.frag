
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
  // fragColor = vec4(
  //   abs(col.x * 0.4) + abs(col.y * 0.4),
  //   abs(col.x * 1.0) + abs(col.y * 1.0),
  //   abs(col.x * 3.) + abs(col.y * 3.),
  //   1.0
  // );
}
