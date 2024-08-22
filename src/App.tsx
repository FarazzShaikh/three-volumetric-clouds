import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { PerfHeadless } from "r3f-perf";
import { Clouds2 } from "./Clouds2";

function Thing() {
  return (
    <>
      {/* <Clouds /> */}
      <Clouds2 />
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <fog attach="fog" args={[0xffffff, 10, 90]} />

        <OrbitControls makeDefault enableDamping={false} />
        <PerspectiveCamera position={[-5, 5, 5]} makeDefault />

        <axesHelper args={[10]} />
        {/* <gridHelper /> */}

        <Thing />

        <Sky />

        <PerfHeadless />
      </Canvas>
      {/* <Ui /> */}
    </>
  );
}
