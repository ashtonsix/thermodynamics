#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D tex;
float width = 400.;
float height = 400.;
float circ_7[32] = float[](
  3., 0.,
  3., 1.,
  2., 2.,
  1., 3.,
  0., 3.,
  -1., 3.,
  -2., 2.,
  -3., 1.,
  -3., 0.,
  -3., -1.,
  -2., -2.,
  -1., -3.,
  0., -3.,
  1., -3.,
  2., -2.,
  3., -1.
);

// generated by running:
// 
// a = new Array(81).fill(-1);
// circ_7.forEach(([x, y], i) => {
//   a[
//     floor((x / (abs(x) + abs(y))) * 4 + 4.5) * 9 +
//     floor((y / (abs(x) + abs(y))) * 4 + 4.5)]
//   ] = i;
// })
lowp int circ_7_index[81] = int[](
  -1, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 9, -1, 7, -1, -1, -1, -1, -1, 10, -1, -1, -1, 6, -1, -1, -1, 11, -1, -1, -1, -1, -1, 5, -1, 12, -1, -1, -1, -1, -1, -1, -1, 4, -1, 13, -1, -1, -1, -1, -1, 3, -1, -1, -1, 14, -1, -1, -1, 2, -1, -1, -1, -1, -1, 15, -1, 1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1
);

out vec4 fragColor;
void main() {
  float mag = 0.;
  float xd = 0.;
  float yd = 0.;
  for (int i = 0; i < 16; i++) {
    float c7x = circ_7[i * 2];
    float c7y = circ_7[i * 2 + 1];
    vec4 c = texture(
      tex,
      vec2(
        vUV.x + c7x / width,
        vUV.y + c7y / height
      )
    );
    // Math trick for effciently mapping a vector to point on a
    // diameter-7 pixelated circle. This trick only works for D7
    // circles, and works because the the x:y aspect ratio is
    // spread evenly for all points of a D7 circle:
    // -4/4, -3/4, -2/4, ... 4/4
    int j = (circ_7_index[
      int((c.x / (abs(c.x) + abs(c.y))) * 4. + 4.5) * 9 +
      int((c.y / (abs(c.x) + abs(c.y))) * 4. + 4.5)
    ] + 8) % 16;

    // diff = somewhere between 0-8 inclusive
    int diff = min(min(abs(i - j), abs((i + 16) - j)), abs(i - (j + 16)));
    // more energy -> smaller max_diff, >=1 -> 0, ~0 -> 8
    int max_diff = int((1. - min(abs(c.x) + abs(c.y), 1.)) * 9.);

    if (diff <= max_diff) {
      float p = (abs(c.x) + abs(c.y)) / float(min(max_diff * 2 + 1, 16));
      float xd_ = -p * (c7x / (abs(c7x) + abs(c7y)));
      float yd_ = -p * (c7y / (abs(c7x) + abs(c7y)));
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
