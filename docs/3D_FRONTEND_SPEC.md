# 3D Frontend Specifications — DevScope AI

## 1. UX flows & Information Architecture

### Candidate User Flow
```
[Landing Page / 3D Hero] ──► [Auth / Register] ──► [Resume Scorer (Upload)]
                                                           │
[Mock Interview Terminal] ◄── [SaaS Dashboard] ◄─────── [GitHub scan]
```
1. **First Touch**: Users hit the landing page and interact with the **Rotating 3D Developer Intelligence Sphere**. Hovering over the nodes reveals real-time platform capabilities.
2. **Analysis Intake**: Candidate registers, uploads their resume PDF (running text-extract and keyword-density checks), and submits their public GitHub username.
3. **Command Dashboard**: Candidate is redirected to the main dashboard. They see the **3D Holographic Score Orb**, simulated EM/CTO panel comments, and personalized learning milestones.
4. **Interview Training**: Candidate enters the **3D Mock Interview Terminal**, interacting with a simulated voice/text recruiter, responding to system design questions, and obtaining performance ratings.

---

## 2. Design System & Style Tokens

### Color Palette (Electric Cyber Theme)
* **Space Background**: `#020205` (Deep space black)
* **Primary Core**: `#6366f1` (Electric Indigo) | `rgb(99, 102, 241)`
* **Secondary Core**: `#d946ef` (Neon Purple) | `rgb(217, 70, 239)`
* **Accent Highlight**: `#06b6d4` (Cyber Cyan) | `rgb(6, 182, 212)`
* **Glow Layer**: `rgba(99, 102, 241, 0.15)`

### Typography System
* **Primary Header Family**: `'Outfit', sans-serif` (extremely bold/thick tracking)
* **Secondary UI Family**: `'Plus Jakarta Sans', sans-serif` (highly readable, geometric geometric sans)

### Glassmorphism Utility Tokens (Tailwind)
```css
.glass-panel-3d {
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.6) 0%, rgba(10, 10, 15, 0.8) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## 3. WebGL / Three.js Scene Architecture

### A. The Hero Globe (Developer Intelligence Sphere)
* **Geometry**: `THREE.SphereGeometry(radius: 2, widthSegments: 64, heightSegments: 64)`
* **Material**: `THREE.MeshPhysicalMaterial` with:
  * `roughness: 0.1`
  * `metalness: 0.1`
  * `transmission: 0.9` (glass thickness)
  * `ior: 1.5` (index of refraction)
* **Neural Particles**: A vertex array (`THREE.BufferGeometry`) of 500 coordinates orbiting the sphere base using standard sine/cosine rotation paths.
* **Nodes**: Small glowing spheres placed on the globe surface representing `GitHub`, `Resume`, and `Career`.

### B. Holographic Score Orb
* **Geometry**: `THREE.IcosahedronGeometry(radius: 1.5, detail: 3)`
* **Rings**: Concentric `THREE.RingGeometry` meshes spinning along opposite axes (`Y` and `X`) to represent progress metrics.
* **Lighting**: PointLight placed in the absolute center of the Icosahedron producing a floating neon aura.

---

## 4. Next.js 15 Folder Structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── github/
│   │   │   └── page.tsx
│   │   ├── resume/
│   │   │   └── page.tsx
│   │   └── interview/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   └── WebGL/
│   │       ├── IntelligenceSphere.tsx
│   │       ├── HolographicScoreOrb.tsx
│   │       └── GitHubUniverse.tsx
│   └── store/
│       └── useStore.ts
├── package.json
└── tailwind.config.js
```
