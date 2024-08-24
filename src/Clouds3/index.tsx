import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, Mesh, Scene } from "three";
import { CloudsRenderer } from "./CloudsRenderer";
import { useTextureViewer } from "./TextureViewer";

export function Clouds3() {
  const targetRef = useRef<Mesh>(null!);
  const gl = useThree((state) => state.gl);
  const renderer = useMemo(() => new CloudsRenderer(gl), []);

  const targetScene = useMemo(() => new Scene(), []);

  useTextureViewer(renderer.textures);

  useFrame(({ camera, gl, scene }) => {
    gl.render(scene, camera);
    renderer.render(targetRef.current, camera);
  }, 1);

  return (
    <>
      {createPortal(
        <>
          <mesh ref={targetRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" side={BackSide} />
          </mesh>
        </>,
        targetScene
      )}
    </>
  );
}
