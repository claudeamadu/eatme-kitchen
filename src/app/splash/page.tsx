
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#E5E7EB] flex items-center justify-center z-50 food-pattern">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Image
          src="https://storage.googleapis.com/project-spark-b6334.appspot.com/static/assets/EatMeLogo.png"
          alt="EatMe Kitchen Logo"
          width={250}
          height={250}
          data-ai-hint="logo"
          priority
        />
      </motion.div>
    </div>
  );
}
