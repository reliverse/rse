import { openai } from "@ai-sdk/openai";
import { defineCommand, relinka } from "@reliverse/prompts";
import { experimental_generateImage as generateImage } from "ai";
import { Buffer } from "buffer";
import ora from "ora";

import { uploadToProvider } from "~/libs/sdk/upload/providers/providers-mod.js";

export default defineCommand({
  meta: {
    name: "generate",
    description: "AI Image Generation & Upload",
  },
  args: {
    prompt: {
      type: "positional",
      description: "Image generation prompt",
      required: true,
    },
    model: {
      type: "string",
      alias: "m",
      description: "AI model (e.g., dall-e-3)",
      default: "dall-e-3",
    },
    provider: {
      type: "string",
      alias: "p",
      description: "Which provider to use for upload",
    },
    size: {
      type: "string",
      description: "Image dimensions (e.g. 1024x1024)",
      default: "1024x1024",
    },
    quality: {
      type: "string",
      description: "Image quality (standard/hd)",
      default: "standard",
    },
  },
  run: async ({ args }) => {
    const spinner = ora(
      `Generating image with prompt: "${args.prompt}"`,
    ).start();

    try {
      // 1. Generate AI Image
      const { image } = await generateImage({
        model: openai.image(args.model),
        prompt: args.prompt,
        providerOptions: {
          openai: {
            size: args.size,
            quality: args.quality,
          },
        },
      });

      spinner.text = "Uploading generated image...";
      const buffer = Buffer.from(image.uint8Array);
      const filename = `ai-gen-${Date.now()}.png`;

      // 2. Upload to chosen/default provider
      const [result] = await uploadToProvider(
        [{ name: filename, data: buffer, type: "image/png" }],
        args.provider,
      );

      if (!result) {
        throw new Error("Failed to upload image: No result returned");
      }

      spinner.succeed("Generation & upload complete!");
      relinka("info", "\nGenerated Image Results:");
      relinka("info", `File: ${result.name}`);
      relinka("info", `URL: ${result.url}`);
      if ("key" in result && result.key) relinka("info", `Key: ${result.key}`);
      if ("uuid" in result && result.uuid)
        relinka("info", `UUID: ${result.uuid}\n`);
    } catch (error) {
      spinner.fail("Image generation failed");
      relinka("error", String(error));
      process.exit(1);
    }
  },
});
