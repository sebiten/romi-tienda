import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "./ui/button";

export default function InstagramSection() {
  const instagramPosts = [
    {
      id: 1,
      imageUrl: "/ig2.png",
      link: "https://www.instagram.com/almalucia.indumentaria",
    },
    {
      id: 2,
      imageUrl: "/ig3.png",
      link: "https://www.instagram.com/almalucia.indumentaria",
    },
    {
      id: 3,
      imageUrl: "/ig4.png",
      link: "https://www.instagram.com/almalucia.indumentaria",
    },
    {
      id: 4,
      imageUrl: "/ig1.png",
      link: "https://www.instagram.com/almalucia.indumentaria",
    },
  ];

  return (
    <section className="relative py-20">
      <div className="absolute -top-8 right-0 h-64 w-64 rounded-full bg-beige-200/20 blur-3xl" />
      <div className="absolute -bottom-8 left-0 h-64 w-64 rounded-full bg-white/40 blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-beige-500">
            Comunidad
          </p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-wide text-beige-900 md:text-5xl">
            Seguinos en Instagram
          </h2>
          <div className="mx-auto mb-6 mt-5 h-px w-24 bg-gradient-to-r from-transparent via-beige-400 to-transparent"></div>
          <p className="mx-auto max-w-2xl text-lg text-beige-700/80">
            Inspiración real, lanzamientos y looks para ver cómo vive la marca fuera de la tienda.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {instagramPosts.map((post) => (
            <Link
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              key={post.id}
              className="group relative aspect-square overflow-hidden rounded-[1.25rem]"
            >
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt="Instagram post"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-beige-900/0 transition-all duration-300 group-hover:bg-beige-900/30">
                <Instagram
                  className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  size={32}
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            className="rounded-full border border-beige-300 bg-white/70 px-8 py-6 text-lg text-beige-800 shadow-sm transition-all duration-300 hover:bg-beige-800 hover:text-beige-50"
          >
            <Link
              href="https://www.instagram.com/almalucia.indumentaria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Explorar más en Instagram
              <Instagram size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
