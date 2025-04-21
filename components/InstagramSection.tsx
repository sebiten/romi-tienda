import { Instagram } from 'lucide-react';
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export default function InstagramSection() {
  // Sample Instagram posts - replace with your actual content
  const instagramPosts = [
    {
      id: 1,
      imageUrl: "/ig2.png",
      link: "https://instagram.com/almalucia08",
    },
    {
      id: 2,
      imageUrl: "/ig3.png",
      link: "https://instagram.com/almalucia08",
    },
    {
      id: 3,
      imageUrl: "/ig4.png",
      link: "https://instagram.com/almalucia08",
    },
    {
      id: 4,
      imageUrl: "/ig1.png",
      link: "https://instagram.com/almalucia08",
    },
  ];

  return (
    <section className="py-20 bg-[#F5F1EA] relative">
      {/* Decorative elements */}
      <div className="absolute -top-8 right-0 w-64 h-64 bg-[#D6C7B0]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 left-0 w-64 h-64 bg-[#D6C7B0]/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-wider mb-4 text-[#5D4B3C]">
            Síguenos en Instagram
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#A69681] to-transparent mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-[#5D4B3C]/80 font-light">
            Descubre nuestras últimas colecciones y obtén inspiración para tus looks diarios
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {instagramPosts.map((post) => (
            <Link 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              key={post.id}
              className="group relative overflow-hidden rounded-lg aspect-square"
            >
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt="Instagram post"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-[#5D4B3C]/0 group-hover:bg-[#5D4B3C]/30 transition-all duration-300 flex items-center justify-center">
                <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">

          <Button
            className="bg-transparent hover:bg-[#A69681] text-[#5D4B3C] hover:text-[#F5F1EA] border border-[#A69681] rounded-full px-8 py-6 text-lg font-light tracking-wide transition-all duration-300 flex items-center gap-2"
          >
            <Link href="https://instagram.com/almalucia08" target="_blank" rel="noopener noreferrer">
              Explora más en Instagram
            </Link>
            <Instagram size={20} />
    
          </Button>
        </div>
      </div>
    </section>
  );
}
