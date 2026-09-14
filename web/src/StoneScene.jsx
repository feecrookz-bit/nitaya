import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, OrbitControls, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'

/*
 * The yard's stone in 3D, textured with its own product photograph.
 *   mode 'slab'  — one slab floating under the copy (the home page) or on
 *                  the product page: riven top face for sandstone and
 *                  limestone, sawn-flat for porcelain.
 *   mode 'laid'  — a field of slabs in the product's pattern (mixed random,
 *                  half bond, stack bond) with dark pointed joints, or a wall
 *                  of strips for cladding.
 *   wet          — the stone after rain: darker, glossier, catching the light.
 * The top face is displaced with layered value noise and flat-shaded, which is
 * what hand-cleft stone looks like: facets, not smooth bumps. Everything is
 * local (no HDRI fetch), so it runs in the single-file preview too.
 */

const MM = 300 // scene unit
const MIXED = [[900, 600], [600, 600], [600, 295], [295, 295]]

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
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

/* A slab body: w × d on the ground, h thick. Riven slabs get a cleft top and
 * nibbled edges; sawn slabs stay crisp. Seed varies the cleft per slab. */
function slabGeometry(w, h, d, riven, seed = 0, segs = 56) {
  const g = new THREE.BoxGeometry(w, h, d, riven ? segs : 1, 1, riven ? Math.max(8, Math.round(segs * d / w)) : 1)
  if (riven) {
    const pos = g.attributes.position
    const half = h / 2, o = seed * 3.7
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      if (y > half - 1e-4) {
        const bed = fbm(x * 0.9 + 3.1 + o, z * 1.6 + 7.7 + o) - 0.5
        const chip = fbm(x * 4.2 + o, z * 4.2) - 0.5
        pos.setY(i, y + bed * 0.09 + chip * 0.035)
      } else if (y > -half + 1e-4) {
        const k = (fbm(x * 3 + z * 3 + o, y * 9) - 0.5) * 0.045
        pos.setX(i, x + Math.sign(x) * k)
        pos.setZ(i, z + Math.sign(z) * k)
      }
    }
    g.computeVertexNormals()
  }
  return g
}

function useMap(texture) {
  return useTexture(texture, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
  })
}

/* Dry stone is matt; wet stone is darker and catches the light. */
function StoneMaterial({ map, wet, flat }) {
  return wet
    ? <meshStandardMaterial map={map} roughness={0.2} metalness={0.06} flatShading={flat} color="#8c877e" />
    : <meshStandardMaterial map={map} roughness={0.96} metalness={0} flatShading={flat} color="#efe7d6" />
}

function Slab({ spin, texture, wet, size, riven, thick }) {
  const group = useRef()
  const [w, d] = [size[0] / MM, size[1] / MM]
  const h = Math.max(0.1, thick / 100)
  const geometry = useMemo(() => slabGeometry(w, h, d, riven), [w, h, d, riven])
  const map = useMap(texture)
  useFrame((_, delta) => { if (group.current && spin) group.current.rotation.y += delta * 0.12 })
  return (
    <group ref={group} position={[0, 0.15, 0]} rotation={[0.08, 0.6, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <StoneMaterial map={map} wet={wet} flat={riven} />
      </mesh>
    </group>
  )
}

/* Lay out a field of slabs in millimetres, then place each with its own
 * offset into the texture so no two faces read the same. */
function layout(pattern, size, W = 4200, D = 3000, joint = 10) {
  const r = rng(11), out = []
  if (pattern === 'mixed') {
    for (let y = 0; y < D;) {
      const rowH = r() > 0.55 ? 600 : 295
      for (let x = 0; x < W;) {
        const opts = MIXED.filter(s => s[1] === rowH)
        const s = opts[Math.floor(r() * opts.length)]
        out.push({ x, y, w: s[0], d: s[1] })
        x += s[0] + joint
      }
      y += rowH + joint
    }
    return out
  }
  const [sw, sd] = size
  const off = pattern === 'stack' ? 0 : pattern === 'third' ? sw / 3 : sw / 2
  let row = 0
  for (let y = 0; y < D; y += sd + joint, row++) {
    for (let x = -((row * off) % (sw + joint)); x < W; x += sw + joint) out.push({ x, y, w: sw, d: sd })
  }
  return out
}

function Field({ texture, wet, size, pattern, riven, thick }) {
  const map = useMap(texture)
  const rects = useMemo(() => layout(pattern, size), [pattern, size])
  const h = Math.max(0.08, thick / 120)
  const geoKey = (q, i) => `${q.w}x${q.d}x${i % 3}`
  const geos = useMemo(() => {
    const cache = {}
    rects.forEach((q, i) => { const k = geoKey(q, i); if (!cache[k]) cache[k] = slabGeometry(q.w / MM, h, q.d / MM, riven, i % 3, 14) })
    return cache
  }, [rects, h, riven])
  const maps = useMemo(() => {
    const r = rng(5)
    return rects.map(q => {
      const m = map.clone(); m.needsUpdate = true
      // the texture is one whole slab; a smaller slab shows part of it, shifted at random
      // a window of 80% of the face, placed at random, mirrored or turned at random, so no two slabs read the same
      const rx = Math.min(1, q.w / size[0]) * 0.8, ry = Math.min(1, q.d / size[1]) * 0.8
      m.offset.set(0.1 + r() * (1 - rx - 0.1), 0.1 + r() * (1 - ry - 0.1))
      m.repeat.set(r() > 0.5 ? rx : -rx, ry)
      m.center.set(0.5, 0.5); m.rotation = r() > 0.5 ? Math.PI : 0
      return m
    })
  }, [rects, map, size])
  const W = 4200 / MM, D = 3000 / MM
  return (
    <group position={[-W / 2, 0, -D / 2]}>
      {/* the pointed joints: a dark bed under everything */}
      <mesh position={[W / 2, -h / 2 - 0.005, D / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W + 0.4, D + 0.4]} />
        <meshStandardMaterial color={wet ? '#1f1e1c' : '#3a3834'} roughness={1} />
      </mesh>
      {rects.map((q, i) => (
        <mesh key={i} geometry={geos[geoKey(q, i)]} position={[(q.x + q.w / 2) / MM, 0, (q.y + q.d / 2) / MM]} receiveShadow>
          <StoneMaterial map={maps[i]} wet={wet} flat={riven} />
        </mesh>
      ))}
    </group>
  )
}

/* Cladding: a wall of strips, the photograph repeated at true strip scale. */
function Wall({ texture, wet }) {
  const map = useMap(texture)
  const m = useMemo(() => { const t = map.clone(); t.repeat.set(2.2, 1.7); t.needsUpdate = true; return t }, [map])
  return (
    <group position={[0, 0.2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.6, 3, 0.12]} />
        <StoneMaterial map={m} wet={wet} flat={false} />
      </mesh>
      <mesh position={[0, -1.55, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color="#3a3834" roughness={1} />
      </mesh>
    </group>
  )
}

function CameraRig({ cam }) {
  const camera = useThree(s => s.camera), controls = useThree(s => s.controls)
  useEffect(() => {
    camera.position.set(...cam.position); camera.fov = cam.fov; camera.updateProjectionMatrix()
    if (controls) { controls.target.set(0, 0, 0); controls.update() }
  }, [cam, camera, controls])
  return null
}

function Scene({ reduced, texture, mode, wet, size, pattern, riven, thick, cam }) {
  const laid = mode === 'laid'
  return (
    <>
      <CameraRig cam={cam} />
      <ambientLight intensity={wet ? 0.7 : 0.9} color="#f2eee6" />
      <directionalLight
        position={[-4, 6, 4]} intensity={wet ? 2.6 : 3.4} color="#fff3dc" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={1} shadow-camera-far={30}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <spotLight position={[5, 3, -5]} angle={0.5} penumbra={0.9} intensity={30} color="#e8d9b0" />
      {wet && <spotLight position={[3, 7, 5]} angle={0.45} penumbra={0.7} intensity={90} color="#ffffff" />}
      <pointLight position={[0, -2.5, 2]} intensity={2} color="#b79a6a" />

      <Suspense fallback={null}>
        {!laid && <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.5} floatingRange={[-0.08, 0.12]}>
          <Slab spin={!reduced} texture={texture} wet={wet} size={size} riven={riven} thick={thick} />
        </Float>}
        {laid && pattern === 'wall' && <Wall texture={texture} wet={wet} />}
        {laid && pattern !== 'wall' && <Field texture={texture} wet={wet} size={size} pattern={pattern} riven={riven} thick={thick} />}
      </Suspense>

      {!laid && <ContactShadows position={[0, -0.75, 0]} opacity={0.7} scale={7} blur={2.4} far={2.2} color="#0a0c0a" frames={reduced ? 1 : Infinity} />}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={laid ? (pattern === 'wall' ? Math.PI / 2.6 : Math.PI / 5.2) : Math.PI / 2.55}
        maxPolarAngle={laid ? (pattern === 'wall' ? Math.PI / 2.1 : Math.PI / 2.9) : Math.PI / 2.55}
        minAzimuthAngle={laid ? -Math.PI / 3 : -Infinity}
        maxAzimuthAngle={laid ? Math.PI / 3 : Infinity}
        makeDefault
      />
    </>
  )
}

/* If WebGL or the texture fails, mark the wrapper so CSS shows the still image. */
class Boundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFail?.() }
  render() { return this.state.failed ? null : this.props.children }
}

const CAMERA = {
  slab: { position: [0, 1.5, 6.6], fov: 26 },
  laid: { position: [0, 5.2, 7.4], fov: 32 },
  wall: { position: [0.6, 0.9, 6.4], fov: 32 },
}

// `texture` is passed in by the app so this lazy chunk shares nothing with
// the app chunk (which the gated build folds into the page).
export default function StoneScene({ texture, mode = 'slab', wet = false, size = [900, 600], pattern = 'half', riven = true, thick = 22 }) {
  const wrap = useRef()
  const [active, setActive] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Stop rendering when the scene is scrolled out of view.
  useEffect(() => {
    if (!wrap.current || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 })
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  const cam = CAMERA[mode === 'laid' && pattern === 'wall' ? 'wall' : mode] || CAMERA.slab
  return (
    <div ref={wrap} className={`hero-3d ${failed ? 'failed' : ''}`} aria-hidden="true">
      {!failed && <Boundary onFail={() => setFailed(true)}><Canvas
        dpr={[1, 2]}
        onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', (e) => { if (e.target.isConnected && wrap.current) setFailed(true) }) }}
        shadows
        frameloop={active && !reduced ? 'always' : 'demand'}
        camera={{ ...cam, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene reduced={reduced} texture={texture} mode={mode} wet={wet} size={size} pattern={pattern} riven={riven} thick={thick} cam={cam} />
      </Canvas></Boundary>}
    </div>
  )
}
