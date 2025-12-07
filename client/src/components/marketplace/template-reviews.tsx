import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  ThumbsUp, 
  CheckCircle,
  User,
  Calendar,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface TemplateReviewsProps {
  templateId: number;
  templateName: string;
}

interface Review {
  id: number;
  userId: string;
  userName?: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TemplateReviews({ templateId, templateName }: TemplateReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [`/api/reviews/template/${templateId}`, { sortBy }],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/template/${templateId}?sortBy=${sortBy}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error("Failed to submit review");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/template/${templateId}`] });
      setShowReviewForm(false);
      setTitle("");
      setComment("");
      setRating(5);
    },
    onError: () => {
      toast({
        title: "Failed to submit review",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Mark review as helpful
  const markHelpful = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to mark as helpful");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/template/${templateId}`] });
    },
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    submitReview.mutate({
      templateId,
      rating,
      title,
      comment,
    });
  };

  const renderStars = (count: number, interactive = false, size = "h-5 w-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviewsData?.reviews?.length > 0
    ? reviewsData.reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / reviewsData.reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-muted-foreground">
                Based on {reviewsData?.total || 0} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData?.ratingDistribution?.[stars] || 0;
                const percentage = reviewsData?.total > 0
                  ? (count / reviewsData.total) * 100
                  : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-12">{stars} star</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Write Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Rating
                </label>
                {renderStars(rating, true, "h-8 w-8")}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Title
                </label>
                <Input
                  placeholder="Summarize your experience..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Review
                </label>
                <Textarea
                  placeholder="Tell others about your experience with this template..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitReview.isPending}
                >
                  Submit Review
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">All Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 animate-pulse mb-2 w-1/3" />
                <div className="h-3 bg-gray-200 animate-pulse w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviewsData?.reviews?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No reviews yet</p>
            <p className="text-muted-foreground">
              Be the first to review this template!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewsData?.reviews?.map((review: Review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {review.userName || "Anonymous"}
                        </span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {renderStars(review.rating)}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                  )}
                  
                  {review.comment && (
                    <p className="text-muted-foreground mb-4">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful.mutate(review.id)}
                      disabled={markHelpful.isPending}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}