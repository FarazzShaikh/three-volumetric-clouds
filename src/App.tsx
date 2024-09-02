import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { Clouds3 } from "./Clouds3";

function Thing() {
  return (
    <>
      {/* <Clouds /> */}
      {/* <Clouds2 /> */}
      <Clouds3 />
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <fog attach="fog" args={[0xffffff, 10, 90]} />

        <OrbitControls
          makeDefault
          enableDamping={false}
          target={[0, 0, 0.00001]}
        />
        <PerspectiveCamera position={[2, 2, 2]} makeDefault />

        <axesHelper args={[10]} />
        <gridHelper />

        <Thing />

        {/* <Sky /> */}

        {/* <PerfHeadless /> */}
        <Perf position="top-left" />
      </Canvas>
      {/* <Ui /> */}
    </>
  );
}
