import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BackSide, Mesh } from "three";
import { CloudsRenderer } from "./CloudsRenderer";
import { useTextureViewer } from "./TextureViewer";

export function Clouds() {
  const targetRef = useRef<Mesh>(null!);
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const renderer = useMemo(() => new CloudsRenderer(gl, size), []);

  useTextureViewer(renderer.textures);

  useEffect(() => {
    renderer.resize(size);
  }, [size]);

  useFrame(({ camera, gl, scene }, dt) => {
    renderer.render(dt, targetRef.current, camera, scene);
  }, 1);

  const boxSize = 1;

  return (
    <group>
      <mesh ref={targetRef}>
        <boxGeometry args={[boxSize, boxSize, boxSize]} />
        <meshBasicMaterial side={BackSide} />
      </mesh>
      {/* <mesh>
        <boxGeometry args={[boxSize, boxSize, boxSize]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh> */}
    </group>
  );
}
