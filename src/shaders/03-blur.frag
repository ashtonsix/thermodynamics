#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D tex;
float width = 400.;
float height = 400.;
float k[42] = float[](
  -2., -1.,
  -2., 0.,
  -2., 1.,
  -1., -1.,
  -1., 0.,
  -1., 1.,
  0., -1.,
  0., 0.,
  0., 1.,
  1., -1.,
  1., 0.,
  1., 1.,
  2., -1.,
  2., 0.,
  2., 1.,
  -1., -2.,
  0., -2.,
  1., -2.,
  -1., 2.,
  0., 2.,
  1., 2.
);

out vec4 fragColor;
void main() {
  float mag = 0.;
  float xd = 0.;
  float yd = 0.;
  for (int i = 0; i < 21; i++) {
    vec4 c = texture(
      tex,
      vec2(
        vUV.x + k[i * 2] / width,
        vUV.y + k[i * 2 + 1] / height
      )
    );
    xd += c.x / 21.;
    yd += c.y / 21.;
    mag += abs(c.x / 21.) + abs(c.y / 21.);
  }

  float mult = mag / (abs(xd) + abs(yd));
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor = vec4(xd * mult, yd * mult, 0., 0.);
}
