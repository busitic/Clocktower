"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface UploadedImage {
  url: string;
  fileKey?: string;
  altText: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("propertyImage", {
    onUploadBegin: () => setIsUploading(true),
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      const newImages = res.map((file) => ({
        url: file.ufsUrl,
        fileKey: file.key,
        altText: "",
      }));
      onChange([...images, ...newImages]);
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    startUpload(Array.from(files));
    e.target.value = ""; // allow re-selecting the same file later
  }

  function updateAltText(index: number, altText: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, altText } : img)));
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {images.map((img, index) => (
        <div key={img.fileKey ?? img.url} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- quick
              preview thumbnail; next/image needs fixed dimensions this
              tight loop doesn't have readily, and these are small previews */}
          <img src={img.url} alt="" className="h-12 w-16 rounded object-cover" />
          <Input
            placeholder="Description for screen readers"
            value={img.altText}
            onChange={(e) => updateAltText(index, e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="image-upload-input"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          {isUploading ? "Uploading..." : "Upload images"}
        </Button>
      </div>
    </div>
  );
}