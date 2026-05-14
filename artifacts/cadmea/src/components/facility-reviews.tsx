import { useState } from "react";
import { Star, Loader2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFacilityReviews, useCreateReview, useGoogleReviewSummary } from "@/lib/community-api";
import { getAlias, setAlias } from "@/lib/fingerprint";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

function StarPicker({ value, onChange, readOnly = false, size = 18 }: { value: number; onChange?: (v: number) => void; readOnly?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${n} stars`}
        >
          <Star
            width={size}
            height={size}
            className={n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}

export function FacilityReviews({ facilityId }: { facilityId: string }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const reviewsQ = useFacilityReviews(facilityId);
  const googleQ = useGoogleReviewSummary(facilityId);
  const create = useCreateReview(facilityId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [alias, setAliasState] = useState(getAlias());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      toast({ title: language === "lt" ? "Įrašykite komentarą" : "Please add a comment", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({ rating, comment, alias });
      if (alias) setAlias(alias);
      setComment("");
      toast({ title: language === "lt" ? "Ačiū už atsiliepimą!" : "Thanks for your review!" });
    } catch (err) {
      toast({ title: language === "lt" ? "Nepavyko" : "Could not submit", description: String(err), variant: "destructive" });
    }
  }

  const summary = reviewsQ.data?.summary;
  const items = reviewsQ.data?.items ?? [];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-primary" />
            {language === "lt" ? "Gyventojų atsiliepimai" : "Resident reviews"}
          </h2>
          {summary && summary.count > 0 && (
            <div className="flex items-center gap-2">
              <StarPicker value={Math.round(summary.average)} readOnly size={14} />
              <span className="text-xs font-bold text-foreground">{summary.average.toFixed(1)}</span>
              <Badge variant="secondary" className="text-[10px]">{summary.count}</Badge>
            </div>
          )}
        </div>

        {googleQ.data && (
          <div className="mb-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                {language === "lt" ? "Google atsiliepimų santrauka" : "Google reviews summary"}
              </p>
              <Badge variant="outline" className="text-[10px]">{googleQ.data.source}</Badge>
            </div>
            <p className="mt-1.5 text-xs italic text-muted-foreground">{googleQ.data.note}</p>
          </div>
        )}

        <form onSubmit={submit} className="border border-border rounded-lg p-3 mb-4 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {language === "lt" ? "Jūsų vertinimas" : "Your rating"}
            </span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === "lt" ? "Pasidalinkite patirtimi…" : "Share your experience…"}
            rows={3}
            maxLength={600}
          />
          <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              value={alias}
              onChange={(e) => setAliasState(e.target.value)}
              maxLength={60}
              placeholder={language === "lt" ? "Pseudonimas (neprivaloma)" : "Alias (optional)"}
              className="sm:max-w-xs"
            />
            <Button type="submit" disabled={create.isPending} size="sm" className="font-semibold sm:ml-auto">
              {create.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {language === "lt" ? "Pateikti" : "Submit"}
            </Button>
          </div>
          <p className="mt-2 text-[10px] italic text-muted-foreground">
            {language === "lt"
              ? "Anoniminis. Vienas atsiliepimas iš naršyklės per 24 val."
              : "Anonymous. One review per browser every 24 hours."}
          </p>
        </form>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {language === "lt" ? "Atsiliepimų dar nėra. Būkite pirmas!" : "No reviews yet. Be the first!"}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarPicker value={r.rating} readOnly size={12} />
                    <span className="text-xs font-bold text-foreground">{r.alias || (language === "lt" ? "Anoniminis" : "Anonymous")}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
