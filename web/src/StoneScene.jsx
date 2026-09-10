import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import textureUrl from './assets/slab-texture.jpg'

/*
 * A single riven Raj Green slab (textured with the yard's own product photo) — 900 × 600 × 22 mm scaled to scene units —
 * floating under the hero copy. The top face is displaced with layered value
 * noise and flat-shaded, which is what hand-cleft stone actually looks like:
 * facets, not smooth bumps. Everything here is local (no HDRI fetch), so it
 * runs inside the single-file preview as well as the deployed site.
 */

const SLAB = { w: 3, h: 0.22, d: 2 } // 900 × 600 at 1 unit = 300 mm, 22 mm thick → 0.073; thickened for legibility

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function smooth(t) { return t * t * (3 - 2 * t) }
function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  const u = smooth(xf), v = smooth(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x, y) {
  let amp = 1, freq = 1, sum = 0, norm = 0
  for (let i = 0; i < 4; i++) {
    sum += valueNoise(x * freq, y * freq) * amp
    norm += amp
    amp *= 0.5
    freq *= 2.1
  }
  return sum / norm
}

function useRivenGeometry() {
  return useMemo(() => {
    const g = new THREE.BoxGeometry(SLAB.w, SLAB.h, SLAB.d, 56, 1, 40)
    const pos = g.attributes.position
    const half = SLAB.h / 2
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      if (y > half - 1e-4) {
        // Cleft top face: broad bedding undulation plus fine chip detail.
        const bed = fbm(x * 0.9 + 3.1, z * 1.6 + 7.7) - 0.5
        const chip = fbm(x * 4.2, z * 4.2) - 0.5
        pos.setY(i, y + bed * 0.09 + chip * 0.035)
      } else if (y < -half + 1e-4) {
        // Sawn underside stays flat; leave it.
      } else {
        // Hand-dressed edges: nibble the side faces in and out slightly.
        const k = (fbm(x * 3 + z * 3, y * 9) - 0.5) * 0.045
        pos.setX(i, x + Math.sign(x) * k)
        pos.setZ(i, z + Math.sign(z) * k)
      }
    }
    g.computeVertexNormals()
    return g
  }, [])
}

function Slab({ spin }) {
  const group = useRef()
  const geometry = useRivenGeometry()
  const map = useTexture(textureUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
  })

  useFrame((_, delta) => {
    if (group.current && spin) group.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={group} position={[0, 0.15, 0]} rotation={[0.08, 0.6, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial map={map} roughness={0.96} metalness={0} flatShading color="#efe7d6" />
      </mesh>
    </group>
  )
}

function Scene({ reduced }) {
  return (
    <>
      {/* fill */}
      <ambientLight intensity={0.9} color="#f2eee6" />
      {/* key: soft, high, front-left, casting */}
      <directionalLight
        position={[-4, 6, 4]} intensity={3.4} color="#fff3dc" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={1} shadow-camera-far={20}
        shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      {/* rim: behind and to the right, lifts the far edge off the photo */}
      <spotLight position={[5, 3, -5]} angle={0.5} penumbra={0.9} intensity={30} color="#e8d9b0" />
      {/* low bounce, as if off the ground */}
      <pointLight position={[0, -2.5, 2]} intensity={2} color="#b79a6a" />

      <Suspense fallback={null}>
        <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.5} floatingRange={[-0.08, 0.12]}>
          <Slab spin={!reduced} />
        </Float>
      </Suspense>

      <ContactShadows position={[0, -0.75, 0]} opacity={0.7} scale={7} blur={2.4} far={2.2} color="#0a0c0a" frames={reduced ? 1 : Infinity} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 2.55}
        maxPolarAngle={Math.PI / 2.55}
        makeDefault
      />
    </>
  )
}

export default function StoneScene() {
  const wrap = useRef()
  const [active, setActive] = useState(true)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Stop rendering when the hero is scrolled out of view.
  useEffect(() => {
    if (!wrap.current || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 })
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="hero-3d" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        shadows
        frameloop={active && !reduced ? 'always' : 'demand'}
        camera={{ position: [0, 1.7, 8.2], fov: 26, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  )
}
