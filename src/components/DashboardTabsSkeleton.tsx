import { Skeleton } from "@/components/ui/skeleton";

const DashboardTabsSkeleton = () => (
  <div className="flex gap-4 mb-6 justify-center">
    <Skeleton className="h-8 w-24 rounded" />
    <Skeleton className="h-8 w-24 rounded" />
    <Skeleton className="h-8 w-24 rounded" />
  </div>
);

export default DashboardTabsSkeleton;
