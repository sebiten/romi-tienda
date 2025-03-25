// components/BlackFridayBanner.tsx
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface BlackFridayBannerProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  backgroundImage?: string;
}

const BlackFridayBanner: React.FC<BlackFridayBannerProps> = ({
  title,
  subtitle,
  ctaLabel,
  ctaLink,
  backgroundImage,
}) => {
  return (
    <section className="relative w-full h-[200px] md:h-[300px] flex items-center justify-center overflow-hidden ">
      {/* Fondo: imagen opcional o gradiente animado */}
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt="Black Friday Background"
          className="absolute inset-0 w-full h-full object-cover dark:invert animate-float"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black opacity-90 animate-gradient" />
      )}
      {/* Overlay glassmorphism */}
      <div className="absolute inset-0 bg-black/70 " />

      {/* Contenido central */}
      <div className="relative z-10 text-center px-4 font-thin">
        <h1 className="text-4xl md:text-6xl font-normal uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 drop-shadow-lg ">
          {title}
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-200">
          {subtitle}
        </p>
        <Link href={ctaLink}>
          <Button className="mt-8">
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default BlackFridayBanner;
