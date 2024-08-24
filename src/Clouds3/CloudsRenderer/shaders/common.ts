export default /* glsl */ `
#define UI0 1597334673U
#define UI1 3812015801U
#define UI2 uvec2(UI0, UI1)
#define UI3 uvec3(UI0, UI1, 2798796415U)
#define UIF (1.0 / float(0xffffffffU))


vec3 hash33(vec3 p) {
	uvec3 q = uvec3(ivec3(p)) * UI3;
	q = (q.x ^ q.y ^ q.z)*UI3;
	return -1. + 2. * vec3(q) * UIF;
}

float remap(float x, float a, float b, float c, float d) {
  return (((x - a) / (b - a)) * (d - c)) + c;
}
`;
