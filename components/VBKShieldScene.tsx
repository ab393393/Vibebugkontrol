'use client';

// Adapted from vbk-shield.jsx in the owner's supplied merge kit.
import { Component, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Shape, MathUtils, ACESFilmicToneMapping } from 'three';
import type { Group } from 'three';

type Input = {x:number;y:number;invalidate:()=>void;alive:boolean};
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Shield({input,onReady}:{input:Input;onReady:(ready:boolean)=>void}) {
  const group = useRef<Group>(null);
  const firstFrame = useRef(false);
  const readyFrame = useRef(0);
  const {invalidate, gl} = useThree();
  useEffect(() => {
    input.invalidate = invalidate;
    const lost = () => { onReady(false); input.alive=false; };
    gl.domElement.addEventListener('webglcontextlost',lost);
    invalidate();
    return () => { cancelAnimationFrame(readyFrame.current); gl.domElement.removeEventListener('webglcontextlost',lost); input.invalidate=()=>{}; };
  },[gl,input,invalidate,onReady]);
  const shape = useMemo(() => {
    const path = new Shape();
    path.moveTo(0,1.28);path.lineTo(1.04,.85);path.lineTo(.93,-.2);
    path.quadraticCurveTo(.72,-.9,0,-1.3);path.quadraticCurveTo(-.72,-.9,-.93,-.2);
    path.lineTo(-1.04,.85);path.closePath();return path;
  },[]);
  const extrusion = useMemo(() => ({depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.065,bevelThickness:.055,curveSegments:18}),[]);
  useFrame((_,delta) => {
    const object = group.current;
    if (!object || !input.alive) return;
    const immediate = document.documentElement.dataset.inputModality === 'keyboard';
    const targetX = -.08 - input.y * .12;
    const targetY = -.2 + input.x * .22;
    object.rotation.x = immediate ? targetX : MathUtils.damp(object.rotation.x,targetX,7,Math.min(delta,.05));
    object.rotation.y = immediate ? targetY : MathUtils.damp(object.rotation.y,targetY,7,Math.min(delta,.05));
    object.position.y = immediate ? 0 : MathUtils.damp(object.position.y,0,7,Math.min(delta,.05));
    if (!firstFrame.current) {
      firstFrame.current=true;
      // Keep the server SVG until an actual frame has had a chance to paint.
      readyFrame.current=requestAnimationFrame(()=>{if(input.alive)onReady(true);});
    }
    const moving = Math.abs(object.rotation.x-targetX)+Math.abs(object.rotation.y-targetY)+Math.abs(object.position.y) > .001;
    if (!immediate && moving) invalidate();
  });
  return <group ref={group} rotation={[-.18,.65,0]} position={[0,.12,0]}>
    <mesh position={[0,0,-.12]}><extrudeGeometry args={[shape,extrusion]}/><meshStandardMaterial color="#d5e8a5" metalness={.65} roughness={.25}/></mesh>
    <mesh position={[0,0,.15]} scale={[.88,.88,.4]}><extrudeGeometry args={[shape,extrusion]}/><meshStandardMaterial color="#235c46" metalness={.35} roughness={.28}/></mesh>
    <group position={[0,.04,.33]}>
      <mesh position={[-.23,-.08,0]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.15,.49,.10]}/><meshStandardMaterial color="#fbfaf6" metalness={.12} roughness={.3}/></mesh>
      <mesh position={[.17,.08,0]} rotation={[0,0,-Math.PI/4]}><boxGeometry args={[.15,.83,.10]}/><meshStandardMaterial color="#fbfaf6" metalness={.12} roughness={.3}/></mesh>
    </group>
    <mesh rotation={[Math.PI/2,.12,0]} position={[0,-1.45,-.1]}><torusGeometry args={[1.23,.013,8,64]}/><meshBasicMaterial color="#d5e8a5" transparent opacity={.35}/></mesh>
  </group>;
}

export function mountShield(host:HTMLElement) {
  const node=document.createElement('div');
  node.className='vbk-shield-canvas';node.setAttribute('aria-hidden','true');host.appendChild(node);
  const input:Input={x:0,y:0,invalidate:()=>{},alive:true};
  const ready=(painted:boolean)=>{if(input.alive)host.toggleAttribute('data-vbk-shield-ready',painted);};
  const failure=()=>{host.removeAttribute('data-vbk-shield-ready');node.hidden=true;input.alive=false;};
  const root=createRoot(node);
  const move=(event:PointerEvent)=>{
    if(event.pointerType!=='mouse'||document.documentElement.dataset.inputModality==='keyboard')return;
    const bounds=host.getBoundingClientRect();
    input.x=MathUtils.clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1);
    input.y=MathUtils.clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1);
    input.invalidate();
  };
  const settle=()=>{input.x=0;input.y=0;input.invalidate();};
  host.addEventListener('pointermove',move,{passive:true});
  host.addEventListener('pointerleave',settle);
  document.addEventListener('keydown',settle,true);
  root.render(<SceneBoundary onFailure={failure}><Canvas frameloop="demand" dpr={[1,1.25]} camera={{position:[0,0,5.5],fov:36}} gl={{alpha:true,antialias:true,powerPreference:'low-power',toneMapping:ACESFilmicToneMapping}} fallback={null}>
    <ambientLight intensity={1.4}/><directionalLight position={[3,4,5]} intensity={3.5}/><directionalLight position={[-4,1,2]} intensity={2} color="#d5e8a5"/>
    <Shield input={input} onReady={ready}/>
  </Canvas></SceneBoundary>);
  return ()=>{
    input.alive=false;host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',settle);document.removeEventListener('keydown',settle,true);
    root.unmount();node.remove();host.removeAttribute('data-vbk-shield-ready');
  };
}
