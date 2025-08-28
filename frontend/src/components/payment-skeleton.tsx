import { Skeleton } from "@/components/ui/skeleton"

export function PaymentSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
