"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type EnquiryReply = { id: string; body: string; authorId: string; createdAt: string | Date };

type EnquiryData = {
  id: string;
  message: string;
  status: "NEW" | "READ" | "RESPONDED" | "CLOSED";
  createdAt: string | Date;
  moveInDate: string | Date | null;
  groupSize: number | null;
  property: { title: string; slug: string; city?: string };
  replies: EnquiryReply[];
  // Whichever side we're NOT viewing as — shown as the other party's name.
  otherPartyName: string;
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  READ: "bg-muted-foreground/15 text-muted-foreground",
  RESPONDED: "bg-campus/15 text-campus",
  CLOSED: "bg-destructive/15 text-destructive",
};

export function EnquiryThread({
  enquiry,
  currentUserId,
  canManageStatus, // true for the landlord side only
}: {
  enquiry: EnquiryData;
  currentUserId: string;
  canManageStatus: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(enquiry.replies);
  const [status, setStatus] = useState(enquiry.status);
  const [isPending, startTransition] = useTransition();

  function sendReply() {
    if (!replyText.trim()) return;

    startTransition(async () => {
      const res = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });

      if (!res.ok) {
        toast.error("Couldn't send reply");
        return;
      }

      setReplies((prev) => [
        ...prev,
        { id: crypto.randomUUID(), body: replyText.trim(), authorId: currentUserId, createdAt: new Date() },
      ]);
      setReplyText("");
      toast.success("Reply sent");
      if (canManageStatus) setStatus("RESPONDED");
    });
  }

  function changeStatus(newStatus: string | null) {
    if (!newStatus) return;
    startTransition(async () => {
      const res = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Couldn't update status");
        return;
      }
      setStatus(newStatus as EnquiryData["status"]);
      toast.success("Status updated");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <Link href={`/properties/${enquiry.property.slug}`} className="font-medium hover:underline">
            {enquiry.property.title}
          </Link>
          <p className="text-muted-foreground text-sm">
            {enquiry.otherPartyName} ·{" "}
            {new Date(enquiry.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>

        {canManageStatus ? (
          <Select value={status} onValueChange={changeStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="RESPONDED">Responded</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={STATUS_STYLES[status]}>{status}</Badge>
        )}
      </CardHeader>

      <CardContent>
        {(enquiry.moveInDate || enquiry.groupSize) && (
          <p className="text-muted-foreground mb-3 text-sm">
            {enquiry.moveInDate &&
              `Move-in: ${new Date(enquiry.moveInDate).toLocaleDateString("en-GB")}`}
            {enquiry.moveInDate && enquiry.groupSize && " · "}
            {enquiry.groupSize && `Group of ${enquiry.groupSize}`}
          </p>
        )}

        <p className="text-sm">{enquiry.message}</p>

        {replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l-2 pl-4">
            {replies.map((reply) => (
              <div key={reply.id}>
                <p className="text-sm">{reply.body}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {new Date(reply.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {status !== "CLOSED" && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="flex-1"
              />
              <Button onClick={sendReply} disabled={isPending || !replyText.trim()}>
                Send
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}