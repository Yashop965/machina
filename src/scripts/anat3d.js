/* anat3d.js — three.js depth-tilt anatomy stage.
   Code-split: this module (and `three`, 691KB min) is lazy-imported from
   Base.astro ONLY when #mark scrolls within 600px of the viewport.
   If WebGL is unavailable or a texture fails, the flat 2D parts stay visible. */
import * as THREE from "three";

export function initAnat3D(stage, canvas) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return; // WebGL unavailable → keep the 2D layered parts
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0, 3.4);

  const group = new THREE.Group();
  scene.add(group);

  // each part → transparent SVG texture on a plane, real Z depth:
  // ring far back, lattice mid, face front (the confirmed depth stack)
  const LAYERS = [
    { part: "ring",    url: "/part_ring.svg",     z: -1.0, size: 2.6 },
    { part: "lattice", url: "/part_geometric.svg", z: 0.0, size: 1.4 },
    { part: "face",    url: "/part_face.svg",     z: 0.8, size: 0.95 },
  ];
  const meshes = {};

  // Opaque "window" disc — the piece the 2D fallback has and the 3D version
  // originally dropped: it sits between lattice (z 0) and face (z 0.8) so the
  // dense web stops just outside the face's ink (lattice ink r≈0.57 vs face
  // ink r≈0.36 measured), leaving a visible lattice band while the face reads
  // cleanly IN FRONT instead of woven into the web.
  const DISC_R = 0.44;
  const DISC_Z = 0.55;
  const discMat = new THREE.MeshBasicMaterial({
    color: 0xeaefef, /* opaque composite of --card over porcelain, matches the stage bg */
    transparent: true, opacity: 1, depthWrite: true, side: THREE.DoubleSide,
  });

  async function loadPart(def) {
    const img = new Image();
    img.src = def.url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || 1080;
    c.height = img.naturalHeight || 1080;
    c.getContext("2d").drawImage(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const ar = c.width / c.height;
    // keep the layer's rendered footprint roughly square within `size`
    const w = ar >= 1 ? def.size : def.size * ar;
    const h = ar >= 1 ? def.size / ar : def.size;
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.z = def.z;
    group.add(mesh);
    meshes[def.part] = mesh;
    return mesh;
  }

  Promise.all(LAYERS.map(loadPart))
    .then(() => {
      // window disc (between lattice and face)
      const disc = new THREE.Mesh(new THREE.CircleGeometry(DISC_R, 64), discMat);
      disc.position.z = DISC_Z;
      group.add(disc);

      stage.classList.add("is-3d"); // hides the 2D <img> parts + knockout
      const ops = { ring: 1, lattice: 1, face: 1, disc: 1 }; // live opacities
      let targetOps = { ring: 1, lattice: 1, face: 1, disc: 1 };
      stage.addEventListener("anat-isolate", (e) => {
        const iso = e.detail;
        LAYERS.forEach((l) => (targetOps[l.part] = iso && iso !== l.part ? 0.1 : 1));
        // the disc belongs to the lattice "band" — dim it whenever the lattice or
        // ring is isolated, keep it when the face is isolated (face window stays clean)
        targetOps.disc = !iso || iso === "face" ? 1 : 0.1;
      });

      // mouse tilt (fine pointers) — group rotates toward the cursor
      let tx = 0, ty = 0, cx = 0, cy = 0;
      if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
        stage.addEventListener("mousemove", (e) => {
          const r = stage.getBoundingClientRect();
          ty = ((e.clientX - r.left) / r.width - 0.5) * 0.55;
          tx = -((e.clientY - r.top) / r.height - 0.5) * 0.55;
        });
        stage.addEventListener("mouseleave", () => (tx = 0, ty = 0));
      }

      const spin = reduce ? 0 : (t) => t * ((2 * Math.PI) / 90); // 90s ring
      const bob = reduce ? () => 0 : (t) => Math.sin(t * (2 * Math.PI / 6)) * 0.05;
      const clock = new THREE.Clock();

      function fit() {
        const s = stage.clientWidth;
        renderer.setSize(s, s, false);
      }
      fit();
      addEventListener("resize", fit);

      let raf;
      function frame() {
        raf = requestAnimationFrame(frame);
        const t = clock.getElapsedTime();

        // depth-tilt: spring the group toward the mouse target
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        group.rotation.x = cy * 0.6;
        group.rotation.y = cx * 0.6;

        // per-part motion (matches the 2D version's character)
        if (meshes.ring) meshes.ring.rotation.z = spin(t);
        if (meshes.face) meshes.face.position.y = bob(t);
        disc.position.y = bob(t); // window travels with the face
        // lattice scroll-scrub (same feel as GSAP version):
        if (meshes.lattice) {
          const doc = document.documentElement;
          const p = Math.min(1, Math.max(0, window.scrollY / (doc.scrollHeight - innerHeight)));
          meshes.lattice.rotation.z = p * (Math.PI / 4); // 45° over the page
        }

        // hover isolation: fade the non-hovered parts
        LAYERS.forEach((l) => {
          const m = meshes[l.part];
          if (!m) return;
          ops[l.part] += (targetOps[l.part] - ops[l.part]) * 0.14;
          m.material.opacity = ops[l.part];
        });
        ops.disc += (targetOps.disc - ops.disc) * 0.14;
        discMat.opacity = ops.disc;
        // while the window is dimmed (lattice/ring isolated) it must stop
        // occluding, or the lattice behind it would look cut out
        discMat.depthWrite = ops.disc > 0.5;

        renderer.render(scene, camera);
      }
      frame();

      // stop rendering when far off-screen (battery)
      new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            if (raf) cancelAnimationFrame(raf);
            frame();
          } else {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        });
      }, { rootMargin: "400px" }).observe(stage);
    })
    .catch(() => { /* texture failed → 2D parts remain visible */ });
}
