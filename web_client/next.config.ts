import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo root so Turbopack resolves workspace packages (@asu/contracts).
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
