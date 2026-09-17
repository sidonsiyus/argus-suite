import { RouteLoadingSkeleton } from "@/components/ui/RouteLoadingSkeleton";

export default function StudentsLoading() {
  return <RouteLoadingSkeleton title="Loading Cadet Directory..." cardsCount={0} />;
}
