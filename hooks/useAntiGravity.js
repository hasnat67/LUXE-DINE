import { useEffect, useRef } from 'react';

/**
 * Custom hook to apply anti-gravity physics (sinusoidal bobbing + rotation)
 * to a Three.js object (Group or Mesh).
 *
 * @param {Object} objectRef - Mutable ref object holding the target THREE.js object
 * @param {Object} options - Configuration for the animation
 */
export function useAntiGravity(objectRef, options = {}) {
  const {
    active = true,
    bobAmplitude = 0.05,
    bobFrequency = 0.0015,
    rotSpeedX = 0.0003,
    rotSpeedY = 0.01
  } = options;

  const animationId = useRef(null);
  const initialY = useRef(null);

  useEffect(() => {
    if (!active || !objectRef.current) {
        if (animationId.current) cancelAnimationFrame(animationId.current);
        return;
    }

    // Capture the initial anchor Y so we rotate around it rather than drifting away
    if (initialY.current === null) {
      initialY.current = objectRef.current.position.y;
    }

    const animate = (time) => {
      if (objectRef.current) {
        // Bobbing: Calculate subtle vertical offset using sine wave
        const yOffset = Math.sin(time * bobFrequency) * bobAmplitude;
        objectRef.current.position.y = initialY.current + yOffset;

        // Rotation: Slow tumbling effect
        objectRef.current.rotation.y += rotSpeedY;
        objectRef.current.rotation.x += rotSpeedX;
      }

      animationId.current = requestAnimationFrame(animate);
    };

    // Kick off loop
    animationId.current = requestAnimationFrame(animate);

    // Cleanup loop
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [active, objectRef, bobAmplitude, bobFrequency, rotSpeedX, rotSpeedY]);
}
