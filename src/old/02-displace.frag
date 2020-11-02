#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;
layout(std140) uniform SceneUniforms {
  float uWidth;
  float uHeight;
};

float centripetal_factor = 1.;

// int circle_size = 16;
// float circle[32] = float[](0., 3., 1., 3., 2., 2., 3., 1., 3., 0., 3., -1., 2., -2., 1., -3., 0., -3., -1., -3., -2., -2., -3., -1., -3., 0., -3., 1., -2., 2., -1., 3.);

// int xy2i(in float x, in float y) {
//   float r = abs(x) / abs(y);
//   r = isinf(r) ? 0. : r >= 1. ? 1. / r : r;
//   return r < 0.16666666666666666 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 0 : 4 : abs(y) >= abs(x) ? 8 : 4 : y >= 0. ? abs(y) >= abs(x) ? 0 : 12 : abs(y) >= abs(x) ? 8 : 12 : r < 0.6666666666666666 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 1 : 3 : abs(y) >= abs(x) ? 7 : 5 : y >= 0. ? abs(y) >= abs(x) ? 15 : 13 : abs(y) >= abs(x) ? 9 : 11 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 2 : 2 : abs(y) >= abs(x) ? 6 : 6 : y >= 0. ? abs(y) >= abs(x) ? 14 : 14 : abs(y) >= abs(x) ? 10 : 10;
// }

int circle_size = 36;
float circle[72] = float[](0., 6., 1., 6., 2., 6., 3., 5., 4., 5., 5., 4., 5., 3., 6., 2., 6., 1., 6., 0., 6., -1., 6., -2., 5., -3., 5., -4., 4., -5., 3., -5., 2., -6., 1., -6., 0., -6., -1., -6., -2., -6., -3., -5., -4., -5., -5., -4., -5., -3., -6., -2., -6., -1., -6., 0., -6., 1., -6., 2., -5., 3., -5., 4., -4., 5., -3., 5., -2., 6., -1., 6.);

int xy2i(in float x, in float y) {
  float r = abs(x) / abs(y);
  r = isinf(r) ? 0. : r >= 1. ? 1. / r : r;
  return r < 0.25 ? r < 0.08333333333333333 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 0 : 9 : abs(y) >= abs(x) ? 18 : 9 : y >= 0. ? abs(y) >= abs(x) ? 0 : 27 : abs(y) >= abs(x) ? 18 : 27 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 1 : 8 : abs(y) >= abs(x) ? 17 : 10 : y >= 0. ? abs(y) >= abs(x) ? 35 : 28 : abs(y) >= abs(x) ? 19 : 26 : r < 0.4666666666666667 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 2 : 7 : abs(y) >= abs(x) ? 16 : 11 : y >= 0. ? abs(y) >= abs(x) ? 34 : 29 : abs(y) >= abs(x) ? 20 : 25 : r < 0.7 ? x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 3 : 6 : abs(y) >= abs(x) ? 15 : 12 : y >= 0. ? abs(y) >= abs(x) ? 33 : 30 : abs(y) >= abs(x) ? 21 : 24 : x >= 0. ? y >= 0. ? abs(y) >= abs(x) ? 4 : 5 : abs(y) >= abs(x) ? 14 : 13 : y >= 0. ? abs(y) >= abs(x) ? 32 : 31 : abs(y) >= abs(x) ? 22 : 23;
}

layout(location=0) out vec4 fragColor1;
layout(location=1) out vec4 fragColor2;
void main() {
  float mag = 0.;
  float xd = 0.;
  float yd = 0.;

  vec4 c = texture(texture1, vUV);
  if (c.w != 0.) {
    fragColor1 = vec4(c.x, c.y, 0., c.w);
    fragColor2 = vec4(0., 0., 0., 0.);
    return;
  }

  for (int i = 0; i < circle_size; i++) {
    float cx = circle[i * 2];
    float cy = circle[i * 2 + 1];
    vec4 c = texture(
      texture1,
      vec2(
        vUV.x + cx / uWidth,
        vUV.y + cy / uHeight
      )
    );
    if (c.z != 0.) {
      float xd_ = -c.z * (cx / (abs(cx) + abs(cy)));
      float yd_ = -c.z * (cy / (abs(cx) + abs(cy)));
      xd += xd_;
      yd += yd_;
      mag += (abs(xd_) + abs(yd_)) * (1. - centripetal_factor);
    }
    {
      int j = (xy2i(c.x, c.y) + circle_size / 2) % circle_size;

      int diff = min(min(abs(i - j), abs((i + circle_size) - j)), abs(i - (j + circle_size)));
      int max_diff = 12;

      if (diff <= max_diff) {
        float p = (abs(c.x) + abs(c.y)) / float(min(max_diff * 2 + 1, circle_size));
        float xd_ = -p * (cx / (abs(cx) + abs(cy))) * (1. - centripetal_factor);
        float yd_ = -p * (cy / (abs(cx) + abs(cy))) * (1. - centripetal_factor);
        xd += xd_;
        yd += yd_;
        mag += abs(xd_) + abs(yd_);
      }
    }
    {
      int j = xy2i(c.x, c.y);

      int diff = min(min(abs(i - j), abs((i + circle_size) - j)), abs(i - (j + circle_size)));
      int max_diff = 3;
      
      if (diff <= max_diff) {
        float p = (abs(c.x) + abs(c.y)) / float(min(max_diff * 2 + 1, circle_size));
        float xd_ = -p * (cx / (abs(cx) + abs(cy))) * centripetal_factor;
        float yd_ = -p * (cy / (abs(cx) + abs(cy))) * centripetal_factor;
        xd += xd_;
        yd += yd_;
        mag += abs(xd_) + abs(yd_);
      }
    }
  }
  
  xd = (c.x + xd) * .5;
  yd = (c.y + yd) * .5;
  mag = (mag + abs(c.x) + abs(c.y)) * .5;

  if (xd == 0.) xd += 0.0000001;
  if (yd == 0.) yd += 0.0000001;

  float mult = mag / (abs(xd) + abs(yd));
  mult = isnan(mult) || isinf(mult) ? 1. : mult;

  fragColor1 = vec4(
    xd * mult,
    yd * mult,
    0.,
    c.w
  );
  fragColor2 = vec4(0., 0., 0., 0.);
}
