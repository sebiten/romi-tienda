import { Skeleton } from "@/components/ui/skeleton";

export default function DesktopFiltersSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-beige-200 shadow p-4 sticky top-24 w-64">
            <Skeleton className="h-5 w-32 bg-beige-200 mb-6" />

            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-6">
                    <Skeleton className="h-4 w-28 bg-beige-200 mb-3" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 bg-beige-200" />
                        <Skeleton className="h-3 w-24 bg-beige-200" />
                        <Skeleton className="h-3 w-16 bg-beige-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}
