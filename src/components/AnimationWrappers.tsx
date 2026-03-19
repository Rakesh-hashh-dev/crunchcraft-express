import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface Props { children: ReactNode; className?: string; }

export const PageTransition = ({ children, className }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FadeInSection = ({ children, className }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className }: Props) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }: Props) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleOnHover = ({ children, className }: Props) => (
  <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }} className={className}>
    {children}
  </motion.div>
);
