import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductSkeletonGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
                <Card
                    key={i}
                    className="border-beige-200 bg-white/70 p-4 rounded-xl shadow-sm"
                >
                    {/* Imagen */}
                    <Skeleton className="w-full h-48 rounded-lg bg-beige-200/60" />

                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-4 w-3/4 bg-beige-200" />
                        <Skeleton className="h-3 w-1/2 bg-beige-200" />
                        <Skeleton className="h-3 w-1/3 bg-beige-200" />
                    </div>

                    <div className="mt-4">
                        <Skeleton className="h-8 w-full bg-beige-300/60 rounded-lg" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
