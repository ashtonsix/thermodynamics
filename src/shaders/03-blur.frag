#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D tex;
layout(std140) uniform SceneUniforms {
  float uWidth;
  float uHeight;
};

float k[15] = float[](
   0.,  1., 1. / 5.,
   0., -1., 1. / 5.,
   1.,  0., 1. / 5.,
  -1.,  0., 1. / 5.,
   0.,  0., 1. / 5.
);

out vec4 fragColor;
void main() {
  float mag = 0.;
  float xd = 0.;
  float yd = 0.;
  for (int i = 0; i < 5; i++) {
    vec4 c = texture(
      tex,
      vec2(
        vUV.x + k[i * 3] / uWidth,
        vUV.y + k[i * 3 + 1] / uHeight
      )
    );
    float m = k[i * 3 + 2];
    xd += c.x * m;
    yd += c.y * m;
    mag += abs(c.x * m) + abs(c.y * m);
  }

  float mult = mag / (abs(xd) + abs(yd));
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor = vec4(xd * mult, yd * mult, 0., 0.);
}
