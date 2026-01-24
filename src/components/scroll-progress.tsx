"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 h-1 bg-green-500 z-[9999] origin-left shadow-[0_0_8px_rgba(34,197,94,0.4)]"
      style={{ scaleX }}
    />
  );
}

export function MovingGreenLine() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[1px] overflow-hidden z-[9998] pointer-events-none opacity-30">
      <motion.div
        className="w-[30%] h-full bg-green-400 shadow-[0_0_10px_#4ade80]"
        animate={{
          x: ["-30vw", "100vw"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
