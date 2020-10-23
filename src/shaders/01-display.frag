#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture1;
uniform sampler2D texture2;

out vec4 fragColor;

float PI =  3.141592653589793;
float PI2 = 6.283185307179586;

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(
      abs(
        mod(
          c.x * 6.0 + vec3(0.0, 4.0, 2.0),
          6.0
        ) - 3.0
      ) - 1.0,
      0.0,
      1.0
    );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
  vec4 c = texture(texture1, vUV);
  if (c.w != 0.) {
    fragColor = vec4(
      0.5,
      0.5,
      0.5,
      0.0
    );
  } else {
    float x = c.x;
    float y = c.y;

    float intensity = 1. - 1. / pow(2., abs(x) + abs(y));

    fragColor = vec4(
      hsl2rgb(vec3(
        ((x == 0. ? sign(y) * PI / 2. : atan(y, x)) + PI) / PI2,
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
