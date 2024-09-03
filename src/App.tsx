import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { Clouds } from "./Clouds";

export default function App() {
  return (
    <>
      <Canvas>
        <OrbitControls
          makeDefault
          enableDamping={false}
          target={[0, 0, 0.00001]}
        />
        <PerspectiveCamera position={[0.9, 0, -0.9]} makeDefault />

        {/* <axesHelper args={[10]} />
        <gridHelper /> */}

        {/* <Sky sunPosition={[-2.0, 2, 2.0]} turbidity={0} /> */}

        <Clouds />

        <Perf position="top-left" />
      </Canvas>
    </>
  );
}
