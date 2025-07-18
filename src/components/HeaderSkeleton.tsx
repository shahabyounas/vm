import { Skeleton } from "@/components/ui/skeleton";

const HeaderSkeleton = () => (
  <div className="flex items-center justify-between px-4 py-4 mb-4">
    <Skeleton className="h-8 w-32 rounded" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  </div>
);

export default HeaderSkeleton;
