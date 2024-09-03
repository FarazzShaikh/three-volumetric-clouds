export default /* glsl */ `

vec3 computeWorldPosition(vec2 uv, sampler2D tDepth, mat4 uProjectionInverse, mat4 uMatrixWorld) {
		float normalizedDepth = texture2D( tDepth, uv).r; 
		
		vec4 ndc = vec4(
			(uv.x - 0.5) * 2.0,
			(uv.y - 0.5) * 2.0,
			(normalizedDepth - 0.5) * 2.0,
			1.0);
		
		vec4 clip = uProjectionInverse * ndc;
		vec4 view = uMatrixWorld * (clip / clip.w);
		vec3 result = view.xyz;
		
		return result;
}
`;
