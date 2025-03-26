import { uploadDirect } from "@uploadcare/upload-client";

export type UploadedUCFile = {
  name: string;
  data: Buffer;
  type: string;
};

type UCResult = {
  url: string;
  uuid: string;
  size: number;
  name: string;
};

export async function uploadToUploadcare(files: UploadedUCFile[]) {
  const publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Missing UPLOADCARE_PUBLIC_KEY");
  }

  const results: UCResult[] = [];

  for (const file of files) {
    const uploadResponse = await uploadDirect(file.data, {
      publicKey,
      store: "auto",
      fileName: file.name,
      contentType: file.type,
      // onProgress: ({ isComputable, value }) => {
      // TODO: progress handling
      // },
    });

    results.push({
      url: `https://ucarecdn.com/${uploadResponse.uuid}/`,
      uuid: uploadResponse.uuid,
      size: uploadResponse.size,
      name: file.name,
    });
  }

  return results;
}
