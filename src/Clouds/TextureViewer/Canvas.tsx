import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  CanvasContainer,
  ChannelSelector,
  LabelContainer,
  NameContainer,
} from "./styled";

const is3DRenderTarget = (
  fbo: THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget
): fbo is THREE.WebGL3DRenderTarget => {
  return (fbo as THREE.WebGL3DRenderTarget).isWebGL3DRenderTarget;
};

export function Canvas({
  fbo,
  gl,
}: {
  fbo: THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget;
  gl: THREE.WebGLRenderer;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [value, setValue] = useState(0);
  const [channels, setChannels] = useState(
    [true, false, false, false].map((_, i) =>
      // @ts-ignore
      fbo.default !== undefined ? i === fbo.default : _
    )
  );

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const letters = ["R", "G", "B", "A"];
    const index = letters.indexOf(e.currentTarget.textContent!);
    const newChannels = [false, false, false, false];
    newChannels[index] = !newChannels[index];
    setChannels(newChannels);
  };

  const drawTexture = useCallback(
    (slice: number) => {
      if (!ctx) return;

      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "purple";
      ctx.fillRect(0, 0, w, h);

      const textureW = fbo.width;
      const textureH = fbo.height;

      const buffer = new Uint8ClampedArray(textureW * textureH * 4);

      gl.setRenderTarget(fbo, slice);
      gl.readRenderTargetPixels(fbo, 0, 0, textureW, textureH, buffer);
      gl.setRenderTarget(null);

      // Scale to canvas size
      const scale = Math.min(w / textureW, h / textureH);
      const scaledBuffer = new Uint8ClampedArray(w * h * 4);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const j =
            (Math.floor(y / scale) * textureW + Math.floor(x / scale)) * 4;

          let selectedIndex = 0;
          if (channels[0]) selectedIndex = 0;
          else if (channels[1]) selectedIndex = 1;
          else if (channels[2]) selectedIndex = 2;
          else if (channels[3]) selectedIndex = 3;

          scaledBuffer[i] = buffer[j + selectedIndex];
          scaledBuffer[i + 1] = buffer[j + selectedIndex];
          scaledBuffer[i + 2] = buffer[j + selectedIndex];
          scaledBuffer[i + 3] = 255;
        }
      }

      const imageData = new ImageData(scaledBuffer, w, h);
      ctx.putImageData(imageData, 0, 0);
    },
    [ctx, gl, channels]
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d")!;
    setCtx(ctx);
  }, []);

  useEffect(() => {
    drawTexture(value);
  }, [drawTexture, channels, value]);

  return (
    <CanvasContainer>
      <canvas ref={canvasRef} />
      {/* @ts-ignore */}
      <NameContainer>{fbo.name}</NameContainer>
      {/* @ts-ignore */}
      {fbo.labels?.[channels.findIndex((c) => c)] && (
        <LabelContainer>
          {/* @ts-ignore */}
          {fbo.labels[channels.findIndex((c) => c)]}
        </LabelContainer>
      )}
      {is3DRenderTarget(fbo) && (
        <span>
          <label>Layer: {value + 1}</label>
          <input
            type="range"
            defaultValue={0}
            min={0}
            max={fbo.depth - 1}
            step={1}
            onChange={(e) => setValue(parseFloat(e.target.value))}
          />
        </span>
      )}

      <ChannelSelector>
        {/* prettier-ignore */}
        <button onClick={onClick} data-selected={channels[0]}>R</button>
        {/* prettier-ignore */}
        <button onClick={onClick} data-selected={channels[1]}>G</button>
        {/* prettier-ignore */}
        <button onClick={onClick} data-selected={channels[2]}>B</button>
        {/* prettier-ignore */}
        <button onClick={onClick} data-selected={channels[3]}>A</button>
      </ChannelSelector>
    </CanvasContainer>
  );
}
