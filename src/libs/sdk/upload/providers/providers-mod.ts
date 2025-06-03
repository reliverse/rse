import type { Buffer } from "buffer";

import path from "@reliverse/pathkit";
import fs from "node:fs/promises";

import { uploadToUploadcare } from "./uploadcare";
import { uploadToUploadthing } from "./uploadthing";

export interface UploadFile {
  name: string;
  data: Buffer;
  type: string;
}

export interface UploadResult {
  url: string;
  size: number;
  name: string;
  uuid?: string;
  key?: string;
}

export async function uploadToProvider(
  files: UploadFile[],
  provider?: string,
): Promise<UploadResult[]> {
  const defaultProvider = process.env.DEFAULT_UPLOAD_PROVIDER || "uploadthing";
  const chosen = provider || defaultProvider;

  switch (chosen) {
    case "uploadcare":
      return uploadToUploadcare(files);
    case "uploadthing":
      return uploadToUploadthing(files);
    default:
      throw new Error(`Unsupported provider: ${chosen}`);
  }
}

export function getMimeType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };
  return mimeTypes[extension] || "application/octet-stream";
}

export async function readFilesFromPaths(filePaths: string[]) {
  return Promise.all(
    filePaths.map(async (filePath) => {
      const data = await fs.readFile(filePath);
      const name = path.basename(filePath);
      const type = getMimeType(filePath);
      return { name, data, type };
    }),
  );
}
