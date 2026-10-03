import {createUploadthing, type FileRouter } from "uploadthing/next";
import { requireRole } from "@/lib/session";
import { UploadThingError } from "uploadthing/server";


const f = createUploadthing();

export const ourFileRouter = {
    propertyImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
        const user = await requireRole("LANDLORD");
        return { landlordId: user.id};
    })

    .onUploadComplete(async ({ metadata, file}) => {
        console.log("Upload complete for landlord:", metadata.landlordId, file.url);
        return { uploadedBy: metadata.landlordId};
    }),
} satisfies FileRouter;


export type OurFileRouter = typeof ourFileRouter;