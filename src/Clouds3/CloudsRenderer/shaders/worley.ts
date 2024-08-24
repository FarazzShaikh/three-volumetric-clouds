export default /* glsl */ `

// Tileable 3D worley noise
float worleyNoise(vec3 uv, float freq) {    
    vec3 id = floor(uv);
    vec3 p = fract(uv);
    
    float minDist = 10000.;
    for (float x = -1.; x <= 1.; ++x)
    {
        for(float y = -1.; y <= 1.; ++y)
        {
            for(float z = -1.; z <= 1.; ++z)
            {
                vec3 offset = vec3(x, y, z);
            	vec3 h = hash33(mod(id + offset, vec3(freq))) * .5 + .5;
    			h += offset;
            	vec3 d = p - h;
           		minDist = min(minDist, dot(d, d));
            }
        }
    }
    
    // inverted worley noise
    return 1. - minDist;
}

float worleyFbm(vec3 p, float freq) {
    return worleyNoise(p*freq, freq) * .625 +
        	 worleyNoise(p*freq*2., freq*2.) * .25 +
        	 worleyNoise(p*freq*4., freq*4.) * .125;
} 
`;
