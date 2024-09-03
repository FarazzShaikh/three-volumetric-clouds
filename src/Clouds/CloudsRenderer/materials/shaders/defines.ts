export default /* glsl */ `

#define PI 3.14159265359
#define N_VOL_STEPS 32
#define STEP_SIZE 0.02
#define MAX_STEPS 128
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define N_LIGHT_STEPS 4
#define LIGHT_STEP_SIZE 0.02

#define NB_STEPS 100

// Params
const float densityScale = 1.0;
const float transmittance = 1.0;
const float darknessThreshold = 0.025;
const float lightAbsorption = 1.0;
const float anisotropicFactor = 0.4;
const float phaseMix = 0.4;
const vec3 lightPosition = vec3(-2.0, 0, 2.0);
const vec3 lightColor = vec3(1.0) * 2.0;
const vec3 ambientLightColor = vec3(1.0) * 0.4;

`;
