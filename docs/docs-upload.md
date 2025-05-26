# Rse CLI: `upload` Command

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

[NPM](https://npmjs.com/@reliverse/rse) — [Discord](https://discord.gg/Pb8uKbwpsJ) — [GitHub Sponsors](https://github.com/sponsors/blefnk) — [Docs](https://docs.reliverse.org/cli)

**@reliverse/rse** offers a streamlined `upload` command for quickly uploading images (and other files) to your preferred hosting destination—perfect for sharing assets or storing them for AI-driven workflows.

## Features

- ⚡ **Instant uploads**  
  Just point to a file or directory, and rse handles the rest.

- ☁️ **Flexible destinations**  
  Customize upload endpoints in your config or environment variables.

- 🖼️ **File-type detection**  
  Automatically identifies image formats (png, jpg, gif, etc.)—but can handle other file types, too.

- ✅ **Seamless CLI integration**  
  Works natively within [@reliverse/rse](https://npmjs.com/@reliverse/rse), keeping your workflow unified.

- 🤖 **AI-powered**  
  rse AI uses this command to store your generated files by using `rse ai generate image`.

## Usage & Examples

**Usage**:

```bash
# Upload a single file using default provider
rse upload myfile.jpg

# Force Uploadcare
rse upload myfile.jpg -p uploadcare

# Multiple files
rse upload file1.jpg file2.pdf -p uploadthing

# Patterns (experimental)
rse upload path/to/image.jpg path/to/directory/**/*.{png,jpg,gif}
```

- Detects the file is an image and uploads it to your chosen provider.
- Returns a direct link to the hosted file.

- **Multiple File Upload**  

```sh
rse upload images/
```

- Recursively scans the `images` directory for supported file types.
- Uploads each file separately, logging the final URLs or statuses.

- **Custom Configuration**  
- Environment variables or a `.config/rse.jsonc`/`.config/rse.ts` file can specify custom hosting settings.
- Example:

```jsonc
// .config/rse.jsonc
{
  "upload": {
    "destination": "customS3orCDN",
    "apiKey": "YOUR_API_KEY"
  }
}
```

## Behind the Scenes

1. **File Detection**  
   The CLI checks if the path is a single file or directory.
2. **Upload Process**  
   - Gathers metadata (file type, size, etc.).
   - Sends data to the configured hosting endpoint.
3. **Result Logging**  
   - On success, prints the final hosted URL or location.
   - On failure, shows an error message with debug info.

## Contributing & Support

We welcome feature requests, bug reports, and community contributions:

- Join our [Discord](https://discord.gg/Pb8uKbwpsJ) to connect directly with the team and community.
- Check out the [Docs](https://docs.reliverse.org/cli) for detailed guides.

If rse helps your workflow, please consider supporting its development:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)

Every star on [GitHub](https://github.com/reliverse/rse) is also appreciated!

## License

[MIT](LICENSE) © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
