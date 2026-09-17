import { RouteLoadingSkeleton } from "@/components/ui/RouteLoadingSkeleton";

export default function StudentDetailLoading() {
  return <RouteLoadingSkeleton title="Loading Student 360..." cardsCount={3} />;
}
