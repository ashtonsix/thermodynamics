#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D tex;
layout(std140) uniform SceneUniforms {
  float uWidth;
  float uHeight;
};

float circle[32] = float[](0., 3., 1., 3., 2., 2., 3., 1., 3., 0., 3., -1., 2., -2., 1., -3., 0., -3., -1., -3., -2., -2., -3., -1., -3., 0., -3., 1., -2., 2., -1., 3.);

int xy2i(in float x, in float y) {
  float r = abs(x) / abs(y);
  r = isinf(r) ? 0. : r >= 1. ? 1. / r : r;
  return r < 0.16666666666666666 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 0 : 4 : abs(y) >= abs(x) ? 8 : 4 : y >= 0. ? abs(y) >= abs(x) ? 0 : 12 : abs(y) >= abs(x) ? 8 : 12 : r < 0.6666666666666666 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 1 : 3 : abs(y) >= abs(x) ? 7 : 5 : y >= 0. ? abs(y) >= abs(x) ? 15 : 13 : abs(y) >= abs(x) ? 9 : 11 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 2 : 2 : abs(y) >= abs(x) ? 6 : 6 : y >= 0. ? abs(y) >= abs(x) ? 14 : 14 : abs(y) >= abs(x) ? 10 : 10;
}

// float circle[72] = float[](0., 6., 1., 6., 2., 6., 3., 5., 4., 5., 5., 4., 5., 3., 6., 2., 6., 1., 6., 0., 6., -1., 6., -2., 5., -3., 5., -4., 4., -5., 3., -5., 2., -6., 1., -6., 0., -6., -1., -6., -2., -6., -3., -5., -4., -5., -5., -4., -5., -3., -6., -2., -6., -1., -6., 0., -6., 1., -6., 2., -5., 3., -5., 4., -4., 5., -3., 5., -2., 6., -1., 6.);

// int xy2i(in float x, in float y) {
//   float r = abs(x) / abs(y);
//   r = isinf(r) ? 0. : r >= 1. ? 1. / r : r;
//   return r < 0.25 ? r < 0.08333333333333333 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 0 : 9 : abs(y) >= abs(x) ? 18 : 9 : y >= 0. ? abs(y) >= abs(x) ? 0 : 27 : abs(y) >= abs(x) ? 18 : 27 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 1 : 8 : abs(y) >= abs(x) ? 17 : 10 : y >= 0. ? abs(y) >= abs(x) ? 35 : 28 : abs(y) >= abs(x) ? 19 : 26 : r < 0.4666666666666667 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 2 : 7 : abs(y) >= abs(x) ? 16 : 11 : y >= 0. ? abs(y) >= abs(x) ? 34 : 29 : abs(y) >= abs(x) ? 20 : 25 : r < 0.7 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 3 : 6 : abs(y) >= abs(x) ? 15 : 12 : y >= 0. ? abs(y) >= abs(x) ? 33 : 30 : abs(y) >= abs(x) ? 21 : 24 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 4 : 5 : abs(y) >= abs(x) ? 14 : 13 : y >= 0. ? abs(y) >= abs(x) ? 32 : 31 : abs(y) >= abs(x) ? 22 : 23;
// }

out vec4 fragColor;
void main() {
  float mag = 0.;
  float xd = 0.;
  float yd = 0.;
  for (int i = 0; i < 16; i++) {
    float cx = circle[i * 2];
    float cy = circle[i * 2 + 1];
    vec4 c = texture(
      tex,
      vec2(
        vUV.x + cx / uWidth,
        vUV.y + cy / uHeight
      )
    );
    int j = (xy2i(c.x, c.y) + 8) % 16;

    // diff = somewhere between 0-8 inclusive
    int diff = min(min(abs(i - j), abs((i + 16) - j)), abs(i - (j + 16)));
    // more energy -> smaller max_diff, >=1 -> 0, ~0 -> 8
    int max_diff = int((1. - min(abs(c.x) + abs(c.y), 1.)) * 9.);

    if (diff <= max_diff) {
      float p = (abs(c.x) + abs(c.y)) / float(min(max_diff * 2 + 1, 16));
      float xd_ = -p * (cx / (abs(cx) + abs(cy)));
      float yd_ = -p * (cy / (abs(cx) + abs(cy)));
      xd += xd_;
      yd += yd_;
      mag += abs(xd_) + abs(yd_);
    }
  }
  vec4 c = texture(tex, vUV);
  xd = (c.x + xd) * .5;
  yd = (c.y + yd) * .5;
  mag = (mag + abs(c.x) + abs(c.y)) * .5;

  if (xd == 0.) xd += 0.0000001;
  if (yd == 0.) yd += 0.0000001;

  float mult = mag / (abs(xd) + abs(yd));
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor = vec4(
    xd * mult,
    yd * mult,
    0.,
    0.
  );
}
