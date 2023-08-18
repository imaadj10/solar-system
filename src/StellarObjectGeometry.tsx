import { useRef } from 'react';
import * as THREE from 'three';
import { ThreeElements, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

type StellarObjectProps = {
  isStar?: boolean;
  isMoon?: boolean;
  model: string;
  scale?: number;
} & ThreeElements['mesh'];

function StellarObjectGeometry(props: StellarObjectProps) {
  const { isStar, isMoon, model, scale, ...meshProps } = props;
  const initialPosition: number[] = meshProps.position as number[];
  const meshRef = useRef<THREE.Mesh>(null!);
  const gltf = useLoader(GLTFLoader, model);

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    mesh.rotation.y += 0.004;
    if (mesh && !isStar) {
      const time = performance.now() * 0.001;
      const planetRadius = initialPosition[0];
      const planetSpeed = 1 / Math.sqrt(planetRadius);

      const planetX = Math.cos(time * planetSpeed) * planetRadius;
      const planetZ = Math.sin(time * planetSpeed) * planetRadius;

      if (isMoon) {
        const moonRadius = initialPosition[1] / 2;
        const moonSpeed = planetSpeed * 5;

        const moonY = Math.cos(time * moonSpeed) * moonRadius;
        const moonZ = Math.sin(time * moonSpeed) * moonRadius + planetZ;

        mesh.position.set(planetX, moonY, moonZ);
      } else {
        mesh.position.set(planetX, initialPosition[1], planetZ);
      }
    }
  });

  return (
    <>
      <mesh ref={meshRef} {...meshProps}>
        <primitive scale={scale? scale: 1} object={gltf.scene} children-0-castShadow />
      </mesh>
      {/* {isMoon ? null : (
        <OrbitLine isMoon={isMoon} radius={initialPosition[0]} />
      )} */}
    </>
  );
}

function OrbitLine({ radius = 1, isMoon = false }) {
  const points = [];
  for (let index = 0; index < 64; index++) {
    const angle = (index / 64) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    isMoon
      ? points.push(new THREE.Vector3(0, y, 0))
      : points.push(new THREE.Vector3(x, 0, z));
  }
  points.push(points[0]);

  return <Line points={points} color={'gray'} lineWidth={0.5} />;
}

export default StellarObjectGeometry;
