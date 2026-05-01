import React, { useState, useEffect, useRef } from 'react';
import { Circle, RoundedRect, Group, Path, Skia, Rect } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

const DOG_SPEED   = 3;
const IDLE_TICKS  = 100;

function Dog({ x, y, s, tick, walking }: { x: number; y: number; s: number; tick: number; walking: boolean }) {
  const bodyW = s * 0.22;
  const bodyH = s * 0.13;
  const headR  = s * 0.08;
  const earH   = s * 0.09;
  const earW   = s * 0.055;
  const tailSwing = Math.sin(tick * 0.25) * 0.6;
  // Diagonal trot: pair A (front-left, back-right) and pair B (front-right, back-left) alternate
  const swing = walking ? Math.sin(tick * 0.55) * 0.45 : 0;
  const legLen = s * 0.07;
  const legW2  = s * 0.04;

  // Hip attachment points (top of each leg)
  const hipFL = { x: x - bodyW * 0.3,  y: y + bodyH * 0.35 }; // front-left
  const hipFR = { x: x + bodyW * 0.3,  y: y + bodyH * 0.35 }; // front-right
  const hipBL = { x: x - bodyW * 0.22, y: y + bodyH * 0.38 }; // back-left
  const hipBR = { x: x + bodyW * 0.22, y: y + bodyH * 0.38 }; // back-right

  return (
    <Group>
      {/* Shadow */}
      <Circle cx={x + 1} cy={y + bodyH * 0.6} r={bodyW * 0.45} color="rgba(0,0,0,0.12)" />
      {/* Body */}
      <RoundedRect x={x - bodyW / 2} y={y - bodyH / 2} width={bodyW} height={bodyH} r={bodyH / 2} color="#c8844a" />
      {/* Legs — rotating from hip pivot, diagonal pairs */}
      <Group transform={[{ translateX: hipFL.x }, { translateY: hipFL.y }, { rotate: swing }]}>
        <RoundedRect x={-legW2/2} y={0} width={legW2} height={legLen} r={legW2/2} color="#a86030" />
      </Group>
      <Group transform={[{ translateX: hipBR.x }, { translateY: hipBR.y }, { rotate: swing }]}>
        <RoundedRect x={-legW2/2} y={0} width={legW2} height={legLen} r={legW2/2} color="#a86030" />
      </Group>
      <Group transform={[{ translateX: hipFR.x }, { translateY: hipFR.y }, { rotate: -swing }]}>
        <RoundedRect x={-legW2/2} y={0} width={legW2} height={legLen} r={legW2/2} color="#a86030" />
      </Group>
      <Group transform={[{ translateX: hipBL.x }, { translateY: hipBL.y }, { rotate: -swing }]}>
        <RoundedRect x={-legW2/2} y={0} width={legW2} height={legLen} r={legW2/2} color="#a86030" />
      </Group>
      {/* Tail */}
      <Group transform={[{ translateX: x + bodyW * 0.46 }, { translateY: y - bodyH * 0.1 }, { rotate: tailSwing }]}>
        <RoundedRect x={-s*0.022} y={-s*0.12} width={s*0.044} height={s*0.12} r={s*0.022} color="#c8844a" />
      </Group>
      {/* Left ear */}
      <Group transform={[{ translateX: x - headR * 0.55 }, { translateY: y - bodyH * 0.25 - headR * 0.5 }, { rotate: -0.2 }]}>
        <RoundedRect x={-earW/2} y={-earH * 0.5} width={earW} height={earH} r={earW/2} color="#8B5020" />
        <RoundedRect x={-earW*0.35} y={-earH*0.35} width={earW*0.7} height={earH*0.65} r={earW*0.35} color="#c06040" />
      </Group>
      {/* Right ear */}
      <Group transform={[{ translateX: x + headR * 0.55 }, { translateY: y - bodyH * 0.25 - headR * 0.5 }, { rotate: 0.2 }]}>
        <RoundedRect x={-earW/2} y={-earH * 0.5} width={earW} height={earH} r={earW/2} color="#8B5020" />
        <RoundedRect x={-earW*0.35} y={-earH*0.35} width={earW*0.7} height={earH*0.65} r={earW*0.35} color="#c06040" />
      </Group>
      {/* Head */}
      <Circle cx={x} cy={y - bodyH * 0.25 - headR * 0.3} r={headR} color="#d4954a" />
      {/* Snout */}
      <RoundedRect x={x - headR*0.45} y={y - bodyH*0.25 - headR*0.05} width={headR*0.9} height={headR*0.6} r={headR*0.3} color="#b87040" />
      {/* Nose */}
      <Circle cx={x} cy={y - bodyH*0.25 + headR*0.12} r={s*0.02} color="#1a0f08" />
      {/* Eyes */}
      <Circle cx={x - headR*0.4} cy={y - bodyH*0.25 - headR*0.55} r={s*0.016} color="#1a0f08" />
      <Circle cx={x + headR*0.4} cy={y - bodyH*0.25 - headR*0.55} r={s*0.016} color="#1a0f08" />
    </Group>
  );
}

export function ShelterRenderer(props: ItemRendererProps) {
  const { x, y, size, state } = props;
  const s   = size;
  const cx  = x + s / 2;
  const d   = s * 0.08; // 3D depth

  // Dog wander state
  const [tick, setTick]       = useState(0);
  const [dogPos, setDogPos]   = useState({ x: cx - s * 0.05, y: y + s * 0.78 });
  const [dogWalking, setDogWalking] = useState(false);
  const dogPosRef    = useRef({ x: cx - s * 0.05, y: y + s * 0.78 });
  const dogTargetRef = useRef({ x: cx - s * 0.05, y: y + s * 0.78 });
  const idleTicksRef = useRef(0);
  const walkingRef   = useRef(false);
  // Center of wander area — spans adjacent tiles
  const wanderCX = cx;
  const wanderCY = y + s * 0.78;
  const wanderR  = s * 2.2;

  useEffect(() => {
    if (state !== 'complete') return;
    const id = setInterval(() => {
      setTick((t) => t + 1);

      if (!walkingRef.current) {
        idleTicksRef.current += 1;
        if (idleTicksRef.current >= IDLE_TICKS) {
          idleTicksRef.current = 0;
          // Pick a point outside the house square (wallX..wallX+wallW, wallY..wallY+wallH)
          let tx: number, ty: number;
          let attempts = 0;
          do {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * wanderR;
            tx = wanderCX + Math.cos(angle) * r;
            ty = wanderCY + Math.sin(angle) * r * 0.5;
            attempts++;
          } while (
            attempts < 20 &&
            tx > wallX && tx < wallX + wallW &&
            ty > wallY && ty < wallY + wallH
          );
          dogTargetRef.current = { x: tx, y: ty };
          walkingRef.current = true;
          setDogWalking(true);
        }
      } else {
        const { x: px, y: py } = dogPosRef.current;
        const { x: tx, y: ty } = dogTargetRef.current;
        const dx = tx - px;
        const dy = ty - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= DOG_SPEED) {
          dogPosRef.current = { x: tx, y: ty };
          setDogPos({ x: tx, y: ty });
          walkingRef.current = false;
          idleTicksRef.current = 0;
          setDogWalking(false);
        } else {
          const nx = px + (dx / dist) * DOG_SPEED;
          const ny = py + (dy / dist) * DOG_SPEED;
          dogPosRef.current = { x: nx, y: ny };
          setDogPos({ x: nx, y: ny });
        }
      }
    }, 50);
    return () => clearInterval(id);
  }, [state]);

  // Doghouse geometry
  const wallX = x + s * 0.1;
  const wallY = y + s * 0.44;
  const wallW = s * 0.62;
  const wallH = s * 0.44;

  const roofBaseY  = wallY + s * 0.02;
  const roofPeakY  = y + s * 0.1;
  const roofLeftX  = x + s * 0.04;
  const roofRightX = x + s * 0.76;
  const roofPeakX  = (roofLeftX + roofRightX) / 2;

  // Large opening — very prominent, nearly half the wall width
  const openW = s * 0.44;
  const openH = s * 0.36;
  const openX = cx - s * 0.05 - openW / 2;
  const openY = wallY + wallH - openH;
  const openPath = Skia.Path.Make();
  openPath.moveTo(openX, wallY + wallH);
  openPath.lineTo(openX, openY + openH * 0.4);
  openPath.arcToOval(
    { x: openX, y: openY, width: openW, height: openH * 0.8 },
    180, -180, false
  );
  openPath.lineTo(openX + openW, wallY + wallH);
  openPath.close();

  // 3D side wall
  const sideWall = Skia.Path.Make();
  sideWall.moveTo(wallX + wallW,     wallY);
  sideWall.lineTo(wallX + wallW + d, wallY - d * 0.65);
  sideWall.lineTo(wallX + wallW + d, wallY - d * 0.65 + wallH);
  sideWall.lineTo(wallX + wallW,     wallY + wallH);
  sideWall.close();

  // 3D roof side
  const roofSide = Skia.Path.Make();
  roofSide.moveTo(roofRightX,     roofBaseY);
  roofSide.lineTo(roofRightX + d, roofBaseY - d * 0.65);
  roofSide.lineTo(roofPeakX  + d, roofPeakY - d * 0.65);
  roofSide.lineTo(roofPeakX,      roofPeakY);
  roofSide.close();

  // Roof front triangle
  const roofFront = Skia.Path.Make();
  roofFront.moveTo(roofLeftX,  roofBaseY);
  roofFront.lineTo(roofPeakX,  roofPeakY);
  roofFront.lineTo(roofRightX, roofBaseY);
  roofFront.close();

  // Bone — sits beside the door
  const boneCX = wallX + wallW * 0.82;
  const boneCY = wallY + wallH - s * 0.06;
  const boneLen = s * 0.18;
  const boneW   = s * 0.03;
  const knobR   = s * 0.04;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Ground shadow */}
        <Circle cx={cx} cy={y + s * 0.94} r={s * 0.3} color="rgba(0,0,0,0.12)" />


        {/* 3D side wall */}
        <Path path={sideWall} color="#8b1a11" />
        {[0.28, 0.54, 0.76].map((f, i) => (
          <Rect key={i} x={wallX + wallW} y={wallY + wallH * f - d * 0.65 * f} width={d} height={s * 0.015} color="rgba(0,0,0,0.2)" />
        ))}

        {/* Front wall */}
        <RoundedRect x={wallX} y={wallY} width={wallW} height={wallH} r={2} color="#c0392b" />
        {[0.2, 0.42, 0.62, 0.82].map((f, i) => (
          <Rect key={i} x={wallX + 2} y={wallY + wallH * f} width={wallW - 4} height={s * 0.014} color="rgba(0,0,0,0.18)" />
        ))}
        <Rect x={wallX + 1} y={wallY} width={s * 0.018} height={wallH} color="rgba(255,255,255,0.12)" />

        {/* Opening — dark interior */}
        <Path path={openPath} color="#0d0807" />
        {/* Opening rim shadow */}
        <Path path={openPath} color="rgba(0,0,0,0.45)" style="stroke" strokeWidth={s * 0.03} />

        {/* Bone */}
        <Group transform={[{ translateX: boneCX }, { translateY: boneCY }, { rotate: -0.4 }]}>
          {/* Shaft */}
          <RoundedRect x={-boneLen / 2} y={-boneW / 2} width={boneLen} height={boneW} r={boneW / 2} color="#e8dcc8" />
          {/* Left knobs */}
          <Circle cx={-boneLen / 2} cy={-knobR * 0.5} r={knobR} color="#e8dcc8" />
          <Circle cx={-boneLen / 2} cy={ knobR * 0.5} r={knobR} color="#e8dcc8" />
          {/* Right knobs */}
          <Circle cx={ boneLen / 2} cy={-knobR * 0.5} r={knobR} color="#e8dcc8" />
          <Circle cx={ boneLen / 2} cy={ knobR * 0.5} r={knobR} color="#e8dcc8" />
          {/* Bone shadow/shading */}
          <RoundedRect x={-boneLen / 2 + 1} y={-boneW / 2 + 1} width={boneLen - 2} height={boneW * 0.4} r={boneW / 2} color="rgba(255,255,255,0.3)" />
        </Group>

        {/* 3D roof side */}
        <Path path={roofSide} color="#3d1f0a" />

        {/* Roof front */}
        <Path path={roofFront} color="#5a2d0c" />
        {[0.3, 0.55, 0.75].map((f, i) => {
          const lx = roofLeftX + (roofPeakX - roofLeftX) * f;
          const ly = roofBaseY - (roofBaseY - roofPeakY) * f;
          const rx = roofRightX - (roofRightX - roofPeakX) * f;
          return <Rect key={i} x={lx} y={ly} width={rx - lx} height={s * 0.014} color="rgba(0,0,0,0.22)" />;
        })}
        <Path path={roofFront} color="rgba(255,255,255,0.1)" style="stroke" strokeWidth={2} />

        {/* Fascia trim */}
        <Rect x={roofLeftX} y={roofBaseY - s * 0.014} width={roofRightX - roofLeftX} height={s * 0.028} color="#e8ddd0" />

        {/* Dog — always in front */}
        {state === 'complete' && (
          <Dog x={dogPos.x} y={dogPos.y} s={s * 2} tick={tick} walking={dogWalking} />
        )}
      </Group>
    </BaseItemRenderer>
  );
}
