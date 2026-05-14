import { useState } from "react";
import { Bot, Database, MessageSquare, Send, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSportsMeta } from "@/lib/sports-api";
import {
  FORUM_CATEGORY_LABEL,
  useCreateForumPost,
  useForumPosts,
  useForumSummary,
  type ForumCategory,
} from "@/lib/forum-api";

const CATEGORY_OPTIONS: ForumCategory[] = ["general", "idea", "facility", "report"];

export default function ForumPage() {
  const [alias, setAlias] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ForumCategory>("general");
  const [district, setDistrict] = useState("__all");
  const [sport, setSport] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const { toast } = useToast();
  const meta = useSportsMeta();
  const summary = useForumSummary();
  const posts = useForumPosts();
  const createPost = useCreateForumPost();

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const post = await createPost.mutateAsync({
        alias: alias || null,
        title,
        body,
        category,
        district: district === "__all" ? null : district,
        sport: sport || null,
        honeypot,
      });
      setTitle("");
      setBody("");
      setSport("");
      setHoneypot("");
      toast({
        title: post.status === "quarantined" ? "Išsiųsta moderavimui" : "Paskelbta",
        description:
          post.status === "quarantined"
            ? "Bot kontrolė įrašą sulaikė peržiūrai."
            : "Jūsų žinutė matoma forume.",
      });
    } catch (err) {
      toast({ title: "Nepavyko paskelbti", description: String(err), variant: "destructive" });
    }
  }

  const s = summary.data;

  return (
    <div className="bg-grid">
      <div className="container mx-auto max-w-6xl px-4 py-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
              <MessageSquare className="mr-1.5 h-3 w-3" />
              Bendruomenės forumas
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Gyventojų idėjos, poreikiai ir problemos
            </h1>
          </div>
          <Badge variant="secondary" className="text-[11px]">
            Rolė: {s?.me.role === "admin" ? "Admin" : "Narys"}
          </Badge>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Nariai
              </p>
              <p className="mt-1 text-2xl font-extrabold">{s?.members ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Įrašai
              </p>
              <p className="mt-1 text-2xl font-extrabold">{s?.visiblePosts ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Bot className="h-3.5 w-3.5" />
                Bot kontrolė
              </p>
              <p className="mt-1 text-sm font-bold">{s?.quarantinedPosts ?? 0} moderuojama</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                DB
              </p>
              <p className="mt-1 break-words text-sm font-bold">{s?.dbFile ?? ".data/forum-db.json"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-foreground">
                <Send className="h-4 w-4 text-primary" />
                Naujas įrašas
              </h2>
              <form className="space-y-3" onSubmit={submitPost}>
                <Input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Vardas arba slapyvardis" />
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tema" required minLength={6} />
                <Select value={category} onValueChange={(value) => setCategory(value as ForumCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>{FORUM_CATEGORY_LABEL[item]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue placeholder="Rajonas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">Visi rajonai</SelectItem>
                    {(meta.data?.districts ?? []).map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={sport} onChange={(event) => setSport(event.target.value)} placeholder="Sporto šaka" />
                <Textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Trumpai aprašykite poreikį, idėją ar problemą"
                  required
                  minLength={20}
                  className="min-h-32 resize-y"
                />
                <Input
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <Button disabled={createPost.isPending} type="submit" className="w-full font-semibold">
                  <Send className="mr-2 h-4 w-4" />
                  Paskelbti
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {(posts.data?.items ?? []).map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{FORUM_CATEGORY_LABEL[post.category]}</Badge>
                    {post.district && <Badge variant="outline" className="text-[10px]">{post.district}</Badge>}
                    {post.sport && <Badge variant="outline" className="text-[10px]">{post.sport}</Badge>}
                    {post.status === "quarantined" && (
                      <Badge className="bg-amber-600 text-[10px] text-white">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Moderuojama
                      </Badge>
                    )}
                  </div>
                  <h3 className="break-words text-base font-extrabold text-foreground">{post.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{post.authorAlias}</span>
                    <span>{new Date(post.createdAt).toLocaleString("lt-LT")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(posts.data?.items ?? []).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Forume dar nėra įrašų.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
