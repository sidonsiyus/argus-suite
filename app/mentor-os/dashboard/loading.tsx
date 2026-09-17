import { RouteLoadingSkeleton } from "@/components/ui/RouteLoadingSkeleton";

export default function DashboardLoading() {
  return <RouteLoadingSkeleton title="Loading Command Center..." cardsCount={4} />;
}
