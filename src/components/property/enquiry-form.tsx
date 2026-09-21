"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  message: z.string().trim().min(20, "Tell the landlord a bit more — at least 20 characters"),
  moveInDate: z.string().optional(),
  groupSize: z.coerce.number().int().min(1).max(20).optional(),
});

export function EnquiryForm({
  propertyId,
  isLoggedIn,
  isOwnProperty,
}: {
  propertyId: string;
  isLoggedIn: boolean;
  isOwnProperty: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

const form = useForm<z.input<typeof formSchema>, unknown, z.output<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { message: "", moveInDate: "", groupSize: undefined },
});

  async function onSubmit(values: z.output<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...values }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      setSent(true);
      toast.success("Enquiry sent to the landlord");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isOwnProperty) return null; // a landlord never enquires about their own listing

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm">
            <Link href="/login" className="text-brick font-medium">
              Log in
            </Link>{" "}
            to contact this landlord.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="font-medium">Enquiry sent</p>
          <p className="text-muted-foreground mt-1 text-sm">
            The landlord will respond via your enquiries page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contact the landlord</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi, I'm interested in this property — is it still available?"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="moveInDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred move-in</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group size</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} value={(field.value as string | number | undefined) ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}