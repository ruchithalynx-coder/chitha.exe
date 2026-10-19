import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js";

const host = document.querySelector("#motion-world");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (host && !reduceMotion) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (error) {
    console.warn("CHITHA.EXE 3D layer could not initialize:", error);
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.z = 15;

    const green = new THREE.Color("#c5ff41");
    const softGreen = new THREE.Color("#789d28");

    // A sculptural wireframe object, placed off-centre so content stays readable.
    const sculpture = new THREE.Group();
    sculpture.position.set(4.1, 0.3, -1.4);
    scene.add(sculpture);

    const knotGeometry = new THREE.TorusKnotGeometry(1.22, 0.035, 180, 8, 2, 5);
    const knot = new THREE.Mesh(
      knotGeometry,
      new THREE.MeshBasicMaterial({
        color: green, wireframe: true, transparent: true, opacity: 0.52
      })
    );
    sculpture.add(knot);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xefffc6, wireframe: true, transparent: true, opacity: 0.16
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.012, 8, 120), ringMaterial);
    ringA.rotation.set(0.8, 0.3, 0.4);
    sculpture.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.008, 8, 120), ringMaterial.clone());
    ringB.material.opacity = 0.11;
    ringB.rotation.set(1.3, 0.8, -0.5);
    sculpture.add(ringB);

    // A second, smaller wireframe object drifts in a different depth plane.
    const cube = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.68, 1),
      new THREE.MeshBasicMaterial({
        color: softGreen, wireframe: true, transparent: true, opacity: 0.26
      })
    );
    cube.position.set(-5.0, -1.5, -2.2);
    scene.add(cube);

    // Fine particles give the page a quiet, moving depth field.
    const particleCount = window.innerWidth < 700 ? 360 : 700;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 23;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
      particleSpeeds[i] = 0.15 + Math.random() * 0.55;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: green, size: 0.022, transparent: true, opacity: 0.55,
        sizeAttenuation: true, depthWrite: false
      })
    );
    scene.add(particles);

    // Floating film-frame panels: abstract 3D frames, not fake project thumbnails.
    const filmFrames = new THREE.Group();
    scene.add(filmFrames);
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: green, wireframe: true, transparent: true, opacity: 0.13
    });
    for (let i = 0; i < 7; i++) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.62, 0.025),
        frameMaterial.clone()
      );
      frame.position.set(-6.3 + i * 2.05, 2.65 + Math.sin(i * 1.4) * 0.5, -4 + (i % 3) * 0.3);
      frame.rotation.z = (i % 2 ? -1 : 1) * 0.08;
      frame.rotation.y = (i - 3) * 0.035;
      filmFrames.add(frame);
    }

    // Three animated, curved filmstrips: each frame has an edit-style preview and sprocket holes.
    function makeFilmTexture(seed) {
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 220;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#080a08"; ctx.fillRect(0, 0, 1200, 220);
      ctx.fillStyle = "#c5ff41"; ctx.fillRect(0, 0, 1200, 3); ctx.fillRect(0, 217, 1200, 3);
      const count = 6, pad = 28, gap = 12, fw = (1200 - pad * 2 - gap * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        const x = pad + i * (fw + gap), hue = (seed * 43 + i * 31) % 110;
        const grad = ctx.createLinearGradient(x, 18, x + fw, 202);
        grad.addColorStop(0, `hsl(${hue}, 22%, 28%)`);
        grad.addColorStop(.55, `hsl(${hue + 28}, 26%, 11%)`);
        grad.addColorStop(1, "#050605");
        ctx.fillStyle = grad; ctx.fillRect(x, 18, fw, 184);
        ctx.fillStyle = `rgba(197,255,65,${.08 + (i % 3) * .05})`;
        for (let b = 0; b < 5; b++) {
          const bh = 18 + ((i * 17 + b * 23 + seed * 9) % 95);
          ctx.fillRect(x + 8 + b * (fw / 5), 180 - bh, fw / 8, bh);
        }
        ctx.strokeStyle = "rgba(225,240,205,.45)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 12, 156 - (i % 3) * 12);
        ctx.lineTo(x + fw * .42, 74 + (i % 2) * 20);
        ctx.lineTo(x + fw - 12, 132 - (i % 4) * 10); ctx.stroke();
        ctx.fillStyle = "#c5ff41"; ctx.fillRect(x + 10, 28, 24, 3);
        ctx.fillStyle = "rgba(255,255,255,.62)"; ctx.font = "bold 12px monospace";
        ctx.fillText(`CUT_0${i + 1}`, x + 10, 194);
      }
      ctx.fillStyle = "#c5ff41";
      for (let x = 12; x < 1200; x += 30) {
        ctx.fillRect(x, 7, 14, 7); ctx.fillRect(x, 206, 14, 7);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      return texture;
    }

    function makeCurvedStrip(seed, width, height, segments) {
      const geometry = new THREE.BufferGeometry(), positions = [], uvs = [], indices = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments, x = (u - .5) * width;
        const wave = Math.sin(u * Math.PI * 2 + seed * .9) * .55 + Math.sin(u * Math.PI * 4) * .16;
        const tilt = Math.cos(u * Math.PI * 2 + seed) * .2;
        positions.push(x, wave + height / 2 + tilt, 0, x, wave - height / 2 + tilt, 0);
        uvs.push(u, 1, u, 0);
        if (i < segments) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices); geometry.computeVertexNormals();
      const material = new THREE.MeshBasicMaterial({
        map: makeFilmTexture(seed), transparent: true, opacity: .72,
        side: THREE.DoubleSide, depthWrite: false
      });
      return new THREE.Mesh(geometry, material);
    }

    const movingStrips = [];
    [
      { seed: 1, y: 2.8, z: -5.2, scale: 1, tilt: -.10 },
      { seed: 2, y: -2.8, z: -4.4, scale: .82, tilt: .13 },
      { seed: 3, y: .2, z: -7, scale: 1.12, tilt: -.05 }
    ].forEach((cfg) => {
      const group = new THREE.Group();
      group.add(makeCurvedStrip(cfg.seed, 14.5, 1.42, 90));
      group.position.set(0, cfg.y, cfg.z); group.scale.setScalar(cfg.scale);
      group.rotation.z = cfg.tilt; scene.add(group);
      movingStrips.push({ group, cfg });
    });

    // A moving edit playhead sweeps across the background.
    const playhead = new THREE.Mesh(
      new THREE.BoxGeometry(.018, 4.6, .018),
      new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: .82, depthWrite: false })
    );
    playhead.position.set(-7.2, 0, -2.7); scene.add(playhead);
    const playheadCap = new THREE.Mesh(
      new THREE.SphereGeometry(.075, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xeaffad })
    );
    playheadCap.position.set(-7.2, 2.3, -2.7); scene.add(playheadCap);

    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    if (finePointer) {
      window.addEventListener("pointermove", (event) => {
        targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    let scrollProgress = 0;
    const updateScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = window.scrollY / maxScroll;
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    let rafId;
    let lastTime = 0;
    const animate = (time) => {
      rafId = requestAnimationFrame(animate);
      // Cap rendering work on high-refresh screens.
      if (time - lastTime < 1000 / 45) return;
      lastTime = time;

      pointer.x += (targetPointer.x - pointer.x) * 0.035;
      pointer.y += (targetPointer.y - pointer.y) * 0.035;

      sculpture.rotation.x = time * 0.00012 + pointer.y * 0.12;
      sculpture.rotation.y = time * 0.00022 + pointer.x * 0.18;
      sculpture.rotation.z = Math.sin(time * 0.00022) * 0.12;
      sculpture.position.y = 0.3 + Math.sin(time * 0.00055) * 0.18;
      cube.rotation.x = time * 0.00015 + pointer.y * -0.08;
      cube.rotation.y = time * 0.0002 + pointer.x * 0.1;
      filmFrames.rotation.y = pointer.x * 0.035;
      filmFrames.position.y = Math.sin(time * 0.0003) * 0.1;
      movingStrips.forEach(({ group, cfg }, index) => {
        group.position.x = Math.sin(time * 0.00008 * (index + 1) + index) * .9;
        group.position.y = cfg.y + Math.sin(time * 0.00025 + index * 1.8) * .22;
        group.rotation.y = Math.sin(time * 0.00016 + index) * .15 + pointer.x * .045;
        group.rotation.x = Math.cos(time * 0.00013 + index) * .08 + pointer.y * .025;
        group.rotation.z = cfg.tilt + Math.sin(time * 0.00018 + index) * .025;
      });
      const scrub = (time * .00022) % 2;
      const scrubX = scrub < 1 ? -7.4 + scrub * 14.8 : 7.4 - (scrub - 1) * 14.8;
      playhead.position.x = scrubX;
      playheadCap.position.x = scrubX;
      playhead.rotation.z = Math.sin(time * .0003) * .035;
      playheadCap.position.y = 2.3 + Math.sin(time * .001) * .12;

      // The camera gently travels as the visitor scrolls through the page.
      camera.position.y += ((-scrollProgress * 1.8 + pointer.y * 0.18) - camera.position.y * 0.025) * 0.025;
      camera.position.x += (pointer.x * 0.22 - camera.position.x * 0.025) * 0.025;
      camera.lookAt(0, -scrollProgress * 1.2, 0);

      const array = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3 + 1;
        array[idx] += particleSpeeds[i] * 0.0018;
        if (array[idx] > 7.5) array[idx] = -7.5;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize, { passive: true });

    // Pause rendering when the tab is hidden to conserve battery.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = 0;
        rafId = requestAnimationFrame(animate);
      }
    });
  }
}
