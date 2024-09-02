import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { Canvas } from "./Canvas";
import { TextureViewerContainer } from "./styled";

export function useTextureViewer(
  fbos: (THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget)[]
) {
  const gl = useThree((state) => state.gl);
  const events = useThree((state) => state.events);

  useEffect(() => {
    if (!events.connected) return;

    const parentElement = events.connected;
    const container = document.createElement("div");
    parentElement.parentElement.appendChild(container);

    const root = createRoot(container);
    root.render(
      <TextureViewerContainer>
        {fbos.map((fbo, index) => (
          <Canvas key={index} fbo={fbo} gl={gl} />
        ))}
      </TextureViewerContainer>
    );

    parentElement.parentElement.style.display = "flex";

    parentElement.style.flex = "1";
    parentElement.style.width = "50%";

    return () => {
      root.unmount();
      container.remove();
    };
  }, [events.connected]);
}
