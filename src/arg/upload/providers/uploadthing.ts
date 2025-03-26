import { UTApi } from "uploadthing/server";

export type UploadedFile = {
  name: string;
  data: Buffer;
  type: string;
};

export async function uploadToUploadthing(files: UploadedFile[]) {
  const apiKey = process.env.UPLOADTHING_API_KEY;
  if (!apiKey) {
    throw new Error("Missing UPLOADTHING_API_KEY");
  }

  const utapi = new UTApi({ token: apiKey });

  const results: { url: string; key: string; size: number; name: string }[] =
    [];
  for (const file of files) {
    const blob = new Blob([file.data], { type: file.type }) as unknown as File;
    const fileEsque = Object.assign(blob, {
      name: file.name,
      lastModified: Date.now(),
    });

    const res = await utapi.uploadFiles(fileEsque);
    const uploadedFile = res as any;
    if (!uploadedFile.data) {
      throw new Error("Failed to upload file");
    }
    results.push({
      // @ts-expect-error TODO fix ts
      url: res.data.ufsUrl,
      // @ts-expect-error TODO fix ts
      key: res.data.key,
      // @ts-expect-error TODO fix ts
      size: res.data.size,
      name: file.name,
    });
  }

  return results;
}
