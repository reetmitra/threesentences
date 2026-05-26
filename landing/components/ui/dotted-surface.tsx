'use client';

import React, { useEffect, useRef } from 'react';

interface DottedSurfaceProps {
  className?: string;
}

export function DottedSurface({ className }: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;
    let renderer: import('three').WebGLRenderer | null = null;

    const init = async () => {
      try {
        const THREE = await import('three');

        // Scene + camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 50;

        // Renderer attached to the canvas element
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.setClearColor(0x000000, 0);

        // 2000 random particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
          positions[i * 3]     = (Math.random() - 0.5) * 100; // x: [-50, 50]
          positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y: [-50, 50]
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60;  // z: [-30, 30]
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.5,
          transparent: true,
          opacity: 0.3,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Resize handler
        const handleResize = () => {
          if (!canvas || !renderer) return;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          points.rotation.x += 0.0001;
          points.rotation.y += 0.0002;
          renderer!.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
          geometry.dispose();
          material.dispose();
          renderer?.dispose();
        };
      } catch {
        // WebGL not available — apply fallback radial gradient via canvas 2D
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2,
          );
          grad.addColorStop(0, 'rgba(255,255,255,0.04)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}
