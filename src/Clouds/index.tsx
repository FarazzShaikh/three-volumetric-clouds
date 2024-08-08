import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CloudRenderer } from "./CloudRenderer";

export function Clouds() {
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const renderer = useMemo(() => new CloudRenderer(gl, size), [gl, size]);

  useEffect(() => {
    renderer.init();
  }, [renderer]);

  useFrame((state) => {
    renderer.render(state.scene, state.camera);
  }, 1);

  return null!;
}
