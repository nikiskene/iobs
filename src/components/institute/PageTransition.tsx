// src/components/institute/PageTransition.tsx

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
};

export default function PageTransition({
  children,
}: Props) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -24,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}