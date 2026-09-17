import { RouteLoadingSkeleton } from "@/components/ui/RouteLoadingSkeleton";

export default function AnalyticsLoading() {
  return <RouteLoadingSkeleton title="Loading analytics..." cardsCount={4} />;
}
