import { usePerf } from "r3f-perf";
import { useEffect, useRef } from "react";

export function Ui() {
  const fpsRef = useRef<HTMLDivElement>(null!);
  const log = usePerf((s) => s.log) as any;

  useEffect(() => {
    if (!log) return;
    fpsRef.current.textContent = `FPS: ${Math.round(
      log.fps
    )} / GPU (ms): ${Math.round(log.gpu)}`;
  }, [log]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          padding: 10,
          color: "white",
          fontFamily: '"Roboto", sans-serif',
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 50,
            fontWeight: "bold",
            marginBottom: 5,
          }}
        >
          New
        </h1>
        <h4
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 5,
          }}
          ref={fpsRef}
        >
          FPS:{" "}
        </h4>
      </div>
    </>
  );
}
