import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CloudRenderer } from "./CloudRenderer";

export function Clouds2() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const gl = useThree((state) => state.gl);
  const renderer = useMemo(() => new CloudRenderer(gl), []);

  useFrame(() => {
    // @ts-ignore
    const parent = meshRef.current.__r3f.parent;
    if (parent) {
      renderer.update(parent);
    }
  });

  const geometry = useMemo(() => new THREE.BoxGeometry(5, 5, 5), []);

  return (
    // <mesh ref={meshRef} material={renderer.material}>
    //   <boxGeometry args={[40, 40, 40]} />
    // </mesh>
    <>
      <mesh ref={meshRef} material={renderer.material} geometry={geometry} />
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </>
  );
}
