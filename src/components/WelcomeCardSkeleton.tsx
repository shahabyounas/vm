import { Skeleton } from "@/components/ui/skeleton";

const WelcomeCardSkeleton = () => (
  <div className="mb-6 bg-gray-900/80 backdrop-blur-sm border border-red-900/30 text-center relative overflow-hidden rounded-2xl">
    <div className="flex flex-col items-center p-6">
      <Skeleton className="h-16 w-16 rounded-full mb-2" />
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-56 mb-2" />
    </div>
    <div className="px-6 pb-4">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);

export default WelcomeCardSkeleton;
