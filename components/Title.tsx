export default function TitleUsable({ title }: { title: string }) {
    return (
      <h2 className="text-5xl md:text-7xl font-thin uppercase tracking-wider text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-500 to-gray-400 drop-shadow-lg animate-glow mt-10">
        {title}
      </h2>
    );
  }
  