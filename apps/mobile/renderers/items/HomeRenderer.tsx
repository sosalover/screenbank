import React from 'react';
import { Group, Rect, RoundedRect, Circle, Path, Skia } from '@shopify/react-native-skia';

interface HomeRendererProps {
  x: number;
  y: number;
  size: number;
}

export function HomeRenderer({ x, y, size }: HomeRendererProps) {
  const s = size;
  const d = s * 0.1; // depth offset for 3D side faces

  // Front wall bounds
  const wallX = x + s * 0.08;
  const wallY = y + s * 0.44;
  const wallW = s * 0.68;
  const wallH = s * 0.5;

  // Roof front triangle points
  const roofLeftX  = x + s * 0.04;
  const roofRightX = x + s * 0.76;
  const roofBaseY  = y + s * 0.46;
  const roofPeakX  = (roofLeftX + roofRightX) / 2;
  const roofPeakY  = y + s * 0.1;

  // Chimney
  const chimneyX = x + s * 0.58;
  const chimneyY = y + s * 0.15;
  const chimneyW = s * 0.1;
  const chimneyH = s * 0.22;

  // Door
  const doorW = s * 0.2;
  const doorH = s * 0.27;
  const doorX = wallX + wallW * 0.38;
  const doorY = wallY + wallH - doorH;

  // Window
  const winSize = s * 0.15;
  const winX = wallX + s * 0.06;
  const winY = wallY + s * 0.1;

  // Right-side wall — parallelogram
  const sideWall = Skia.Path.Make();
  sideWall.moveTo(wallX + wallW,     wallY);
  sideWall.lineTo(wallX + wallW + d, wallY - d);
  sideWall.lineTo(wallX + wallW + d, wallY - d + wallH);
  sideWall.lineTo(wallX + wallW,     wallY + wallH);
  sideWall.close();

  // Right-side roof face
  const roofSide = Skia.Path.Make();
  roofSide.moveTo(roofRightX,     roofBaseY);
  roofSide.lineTo(roofRightX + d, roofBaseY - d);
  roofSide.lineTo(roofPeakX  + d, roofPeakY - d);
  roofSide.lineTo(roofPeakX,      roofPeakY);
  roofSide.close();

  // Front roof triangle
  const roofFront = Skia.Path.Make();
  roofFront.moveTo(roofLeftX,  roofBaseY);
  roofFront.lineTo(roofPeakX,  roofPeakY);
  roofFront.lineTo(roofRightX, roofBaseY);
  roofFront.close();

  // Chimney side face
  const chimneySide = Skia.Path.Make();
  chimneySide.moveTo(chimneyX + chimneyW,     chimneyY);
  chimneySide.lineTo(chimneyX + chimneyW + d, chimneyY - d);
  chimneySide.lineTo(chimneyX + chimneyW + d, chimneyY - d + chimneyH);
  chimneySide.lineTo(chimneyX + chimneyW,     chimneyY + chimneyH);
  chimneySide.close();

  const smokeX = chimneyX + chimneyW / 2;

  return (
    <Group>
      {/* Base shadow */}
      <Rect
        x={wallX + d * 0.5}
        y={wallY + wallH + 1}
        width={wallW + d}
        height={s * 0.03}
        color="rgba(0,0,0,0.15)"
      />

      {/* Chimney back/side */}
      <Rect x={chimneyX} y={chimneyY} width={chimneyW} height={chimneyH} color="#6B5840" />
      <Path path={chimneySide} color="#5A4A34" />

      {/* Roof right side (darker red) */}
      <Path path={roofSide} color="#922B21" />

      {/* Right-side wall (darker tan) */}
      <Path path={sideWall} color="#A0835A" />

      {/* Front wall */}
      <RoundedRect x={wallX} y={wallY} width={wallW} height={wallH} r={2} color="#D2B48C" />
      {/* Wall texture lines */}
      <Rect x={wallX + 2} y={wallY + wallH * 0.32} width={wallW - 4} height={1} color="rgba(0,0,0,0.07)" />
      <Rect x={wallX + 2} y={wallY + wallH * 0.62} width={wallW - 4} height={1} color="rgba(0,0,0,0.07)" />

      {/* Front roof */}
      <Path path={roofFront} color="#C0392B" />
      {/* Roof edge shadow */}
      <Path path={roofFront} color="rgba(0,0,0,0.1)" style="stroke" strokeWidth={1.5} />

      {/* Chimney front */}
      <Rect x={chimneyX} y={chimneyY} width={chimneyW} height={chimneyH} color="#8B7355" />

      {/* Door */}
      <RoundedRect x={doorX} y={doorY} width={doorW} height={doorH} r={doorW / 2} color="#5D4037" />
      <Circle cx={doorX + doorW * 0.75} cy={doorY + doorH * 0.55} r={s * 0.02} color="#FDD835" />

      {/* Window */}
      <RoundedRect x={winX} y={winY} width={winSize} height={winSize} r={2} color="#AED6F1" />
      <Rect x={winX} y={winY + winSize / 2 - 0.5} width={winSize} height={1} color="rgba(255,255,255,0.8)" />
      <Rect x={winX + winSize / 2 - 0.5} y={winY} width={1} height={winSize} color="rgba(255,255,255,0.8)" />

      {/* Smoke wisps */}
      <Circle cx={smokeX} cy={chimneyY - s * 0.04} r={s * 0.025} color="rgba(200,200,200,0.55)" />
      <Circle cx={smokeX + s * 0.02} cy={chimneyY - s * 0.09} r={s * 0.02} color="rgba(200,200,200,0.38)" />
    </Group>
  );
}
