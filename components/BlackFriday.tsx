import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="py-6  md:py-8">
      <div className="container mx-auto ">
        <div className="relative overflow-hidden rounded-[2rem] border border-beige-200/70">
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt="Campaña destacada"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-beige-700 via-beige-800 to-beige-900" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(40,26,18,0.84)_0%,rgba(40,26,18,0.52)_55%,rgba(40,26,18,0.2)_100%)]" />
          <div className="absolute inset-0 brand-grid opacity-20" />

          <div className="relative z-10 flex min-h-[320px] items-center px-6 py-10 md:px-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-beige-200/80">
                Selección destacada
              </p>
              <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-beige-100/90 md:text-lg">
                {subtitle}
              </p>
              <Button
                asChild
                className="mt-7 rounded-full bg-white px-6 text-beige-900 shadow-lg transition hover:bg-beige-100"
              >
                <Link href={ctaLink} className="inline-flex items-center gap-2">
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlackFridayBanner;
