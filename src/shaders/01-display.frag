#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;

out vec4 fragColor;

float PI =  3.141592653589793;

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(
      abs(
        mod(
          c.x * 6. + vec3(0., 4., 2.),
          6.
        ) - 3.
      ) - 1.,
      0.,
      1.
    );
    return c.z + c.y * (rgb - .5) * (1. - abs(2. * c.z - 1.));
}

float mag(in vec2 e) {
  return abs(e.x) + abs(e.y);
}
float mag(in vec4 e) {
  return abs(e.x) + abs(e.y);
}

void main() {
  vec4 c = texture(texture1, vUV);
  if (c.w == -1.) {
    fragColor = vec4(
      0.5,
      0.5,
      0.5,
      0.0
    );
  } else {
    float x = c.x;
    float y = c.y;

    float acf = (
      c.z > mag(c) ?
        1. - min(mag(c), c.z) / (2. * max(mag(c), c.z)) :
            min(mag(c), c.z) / (2. * max(mag(c), c.z))
      );
    acf = isnan(acf) || isinf(acf) ? 0. : acf;

    float intensity = 1. - 1. / pow(2., abs(x) + abs(y));

    // fragColor = vec4(acf, intensity, 0., 1.);

    fragColor = vec4(
      hsl2rgb(vec3(
        ((x == 0. ? sign(y) * PI / 2. : atan(y, x)) + PI) / (2. * PI),
        1.,
        intensity * .7
      )),
      1.
    );
    fragColor = vec4(
      hsl2rgb(
        mix(
          vec3(1.6, 1., 0.),
          vec3(.8, 1., 1.),
          intensity
        )
      ),
      1.
    );
  }
}
