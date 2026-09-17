import { RouteLoadingSkeleton } from "@/components/ui/RouteLoadingSkeleton";

export default function StudentAnalyticsLoading() {
  return <RouteLoadingSkeleton title="Loading cadet analytics..." cardsCount={4} />;
}
