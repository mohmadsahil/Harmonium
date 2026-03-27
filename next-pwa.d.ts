declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: unknown[];
  }

  type WithPWA = (nextConfig?: NextConfig) => NextConfig;

  export default function withPWA(options: PWAOptions): WithPWA;
}
