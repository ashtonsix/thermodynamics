vec4 displayMode_intensity(in vec2 vUV, in vec4 c) {
  float intensity = scale(mag(c));

  return colorScale(intensity);
}
vec4 displayMode_intensityWithAnima(in vec2 vUV, in vec4 c) {
  vec4 c2 = texture(texture3, vUV);

  float intensity = scale(mag(c));
  float afrac = abs(c2.x) / mag(c);
  afrac = (isnan(afrac) || isinf(afrac)) ? 0. : min(afrac, 1.);

  return vec4(
    hsl2rgb(vec3(float(getAnimaType(mag(c), c2.x)) / 4., afrac, intensity * .7)),
    1.
  );
}
vec4 displayMode_intensityRelative(in vec2 vUV, in vec4 c) {
  float x = mag(c) /
  ((
    mag(texture(texture1, vec2(vUV.x + 1. / uSize, vUV.y))) +
    mag(texture(texture1, vec2(vUV.x - 1. / uSize, vUV.y))) +
    mag(texture(texture1, vec2(vUV.x, vUV.y + 1. / uSize))) +
    mag(texture(texture1, vec2(vUV.x, vUV.y - 1. / uSize)))
  ) / 4.);

  float intensity = scale(x);

  return colorScale(intensity);
}
vec4 displayMode_difference(in vec2 vUV, in vec4 c) {
  vec4 c2 = texture(texture2, vUV);
  float m = abs(mag(c) - mag(c2));

  float intensity = scale(m * 50.);

  return colorScale(intensity);
}
vec4 displayMode_theta(in vec2 vUV, in vec4 c) {
  float intensity = scale(mag(c));

  return vec4(
    hsl2rgb(vec3(
      ((c.x == 0. ? sign(c.y) * PI / 2. : atan(c.y, c.x)) + PI) / (2. * PI),
      1.,
      intensity * .7
    )),
    1.
  );
}
vec4 displayMode_centripetal(in vec2 vUV, in vec4 c) {
  float cf = c.z / mag(c);
  if (cf <= 1.) cf = 1. / cf;
  float intensity = scale(.1 * cf);

  return colorScale(intensity);
}
