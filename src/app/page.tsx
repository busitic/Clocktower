import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      {/* Should render in Bricolage Grotesque, tight tracking */}
      <h1 className="text-5xl font-semibold">Clocktower</h1>

      {/* Should render in Geist, muted grey */}
      <p className="text-muted-foreground mt-4 text-lg">
        Student housing in Ormskirk, ranked by walk time to campus.
      </p>

      <Card className="mt-10">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          {/* Our custom campus token — should be green */}
          <Badge className="bg-campus text-campus-foreground">
            <MapPin className="mr-1 size-3" />8 min walk
          </Badge>
          {/* Our custom brick token — should be terracotta red */}
          <Badge className="bg-brick text-brick-foreground">£475 pcm</Badge>
          <Button className="ml-auto">Primary button</Button>
        </CardContent>
      </Card>
    </main>
  );
}