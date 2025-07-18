import { Skeleton } from "@/components/ui/skeleton";

const ProgressCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-2xl p-6 min-h-[220px] shadow-2xl mb-6">
    <Skeleton className="h-6 w-40 mb-4" />
    <Skeleton className="h-4 w-56 mb-4" />
    <Skeleton className="h-4 w-full rounded mb-2" />
    <Skeleton className="h-8 w-32 mt-6 mx-auto" />
  </div>
);

export default ProgressCardSkeleton;
