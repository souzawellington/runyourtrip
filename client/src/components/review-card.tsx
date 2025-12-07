import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
    id: number;
    userId: string;
    userName?: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {review.userName || "Anonymous User"}
              </span>
              <span className="text-sm text-muted-foreground">
                • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <h4 className="font-medium text-lg mb-2">{review.title}</h4>
        <p className="text-muted-foreground">{review.comment}</p>
      </CardContent>
    </Card>
  );
}