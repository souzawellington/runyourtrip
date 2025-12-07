import { useQuery } from "@tanstack/react-query";
import { ReviewCard } from "@/components/review-card";
import { ReviewForm } from "@/components/review-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: number;
  userId: string;
  userName?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface TemplateReviewsProps {
  templateId: number;
  canReview?: boolean;
}

export function TemplateReviews({ templateId, canReview = false }: TemplateReviewsProps) {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: [`/api/reviews/${templateId}`],
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <div className="text-muted-foreground">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Review Form */}
      {canReview && (
        <ReviewForm templateId={templateId} />
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Reviews
        </h3>
        
        {reviews.length === 0 ? (
          <Alert>
            <AlertDescription>
              No reviews yet. Be the first to review this template!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}