import type { NextConfig } from "next";

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
};

const remotePatterns: RemotePattern[] = [];

function addRemotePattern(pattern: RemotePattern) {
  const exists = remotePatterns.some(
    (entry) =>
      entry.protocol === pattern.protocol &&
      entry.hostname === pattern.hostname &&
      entry.pathname === pattern.pathname,
  );

  if (!exists) {
    remotePatterns.push(pattern);
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  const { hostname, protocol } = new URL(supabaseUrl);
  const normalizedProtocol = protocol.replace(":", "");

  addRemotePattern({
    protocol: normalizedProtocol === "http" ? "http" : "https",
    hostname,
    pathname: "/storage/v1/object/public/**",
  });
}

// Fallback seguro para entornos donde la URL pública no esté disponible
// al cargar next.config, manteniendo el alcance limitado al storage público.
addRemotePattern({
  protocol: "https",
  hostname: "*.supabase.co",
  pathname: "/storage/v1/object/public/**",
});

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;
