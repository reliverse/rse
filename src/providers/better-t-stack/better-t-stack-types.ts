// Auto-generated type declarations for templates.
export interface FileMetadata {
  updatedAt?: string;
  updatedHash?: string;
}
export interface TemplatesFileContent {
  content: string | Record<string, unknown>;
  type: "text" | "json" | "binary";
  hasError?: boolean;
  error?: string;
  jsonComments?: Record<number, string>;
  binaryHash?: string;
  metadata?: FileMetadata;
}
export interface Template {
  name: string;
  description: string;
  config: { files: Record<string, TemplatesFileContent> };
  updatedAt?: string;
}
