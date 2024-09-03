# ThreeJS Volumetric Clouds

Experimental volumetric clouds in ThreeJS following "[Nubis, Evolved](https://www.guerrilla-games.com/read/nubis-evolved)" and associated work by Guerrilla Games.

Current implementation is based on the "Envelope Model" described in the presentation. It implements the following:

- Envelope generation
- 3D texture of Perlin-worley noise
- Envelope erosion
- Ray marching using adaptive sampling
- Lighting model with Multiscattering and Anisotropic phase function

THIS IS NOT A FULL IMPLEMENTATION and not intended for production use. It is a work in progress and may be abandoned at any time. It is as far as I got in a couple weeks of work. I may or may not continue working on it in the future.

![video](https://github.com/FarazzShaikh/three-volumetric-clouds/raw/main/public/2024-09-03%2020-44-09.mp4)
