# RSE Web UI

A modern web interface for the Reliverse Stack Engine (RSE) that replicates the CLI functionality in a beautiful, user-friendly web application.

## Features

- **🎨 Modern UI**: Built with React 19, Tailwind CSS, and shadcn/ui components
- **⚡ Powered by Bun**: Leverages Bun's capabilities for fast performance and native APIs
- **✨ Project Creation**: Complete project creation flow with multiple project types
- **🌓 Dark/Light Mode**: Built-in theme switching
- **📱 Responsive Design**: Works on desktop and mobile devices

## Main Menu Options

### ✨ Create a project in rse web ui

Replicates the full CLI project creation flow with:

- **Project Type Selection**: Web, Mobile, VS Code Extension, Browser Extension, CLI
- **Configuration Options**: Architecture, frameworks, domains, i18n settings
- **Real-time Progress**: Visual feedback during project creation
- **CLI Integration**: Uses the same underlying logic as the CLI

### 💬 Chat with Reliverse AI

*Coming Soon* - AI-powered assistance for project development

### 👈 Exit

Gracefully shuts down the web server with proper user feedback

## Architecture

```bash
src/app/web/src/
├── app/                    # Server-side code
│   ├── api/               # API handlers
│   │   └── routes/        # API routes
│   │       └── handlers.tsx   # Project creation & shutdown APIs
│   ├── rese.tsx           # Rese.js framework config
│   ├── index.html         # Main entry HTML file
│   ├── layout.tsx         # Main React application
│   └── styles/            # Global styles
├── ui/                    # UI components
│   ├── components/        # Custom components
│   │   ├── MainMenu.tsx   # Main menu interface
│   │   ├── CreateProject.tsx # Project creation flow
│   │   ├── ExitPage.tsx   # Server shutdown interface
│   │   └── ProjectCreationService.tsx # CLI integration service
│   └── primitives/        # shadcn/ui base components
└── lib/                   # Utilities
    ├── utils.ts           # Common utilities
    └── theme.tsx          # Theme provider
```

## Technology Stack

- **Runtime**: Bun (required for full functionality)
- **Frontend**: React 19 (Rese.js framework)
- **Styling**: Tailwind CSS + shadcn/ui
- **Server**: Bun's native serve API
- **Hot Reload**: Built-in Bun HMR support

## Usage

### Development

```bash
bun dev:web  # Start with hot reloading
```

### Production

```bash
rse web      # Start production server
```

## API Endpoints

### POST /api/create-project

Creates a new project based on the provided configuration.

**Request Body:**

```typescript
{
  name: string;
  category: "website" | "mobile" | "vscode" | "browser" | "cli";
  architecture?: "fullstack" | "separated";
  mobileFramework?: "lynx" | "react-native";
  domain?: string;
  enableI18n: boolean;
}
```

### POST /api/shutdown

Gracefully shuts down the web server.

## Integration with CLI

The web UI integrates directly with the CLI implementation:

- **Project Creation**: Uses the same `createWebProject` function from the CLI
- **Configuration**: Converts web form data to CLI-compatible config objects
- **Templates**: Supports the same project templates as the CLI
- **Validation**: Implements the same validation rules

## Bun-Specific Features

The web UI leverages Bun's capabilities:

- **File System**: Direct access to Bun's file APIs for project creation
- **Dynamic Imports**: Runtime import of CLI modules
- **Performance**: Fast startup and execution times
- **Native APIs**: Built-in fetch, serve, and other web standards

## Browser Compatibility

- Modern browsers with ES2022+ support
- WebSocket support for hot reloading (development)
- Responsive design for mobile devices

## Contributing

When adding new features:

1. Follow the existing architecture patterns
2. Use TypeScript for type safety
3. Leverage Bun's features where appropriate
4. Maintain consistency with the CLI implementation
5. Add proper error handling and user feedback

## Environment Detection

The code automatically detects Bun runtime:

```typescript
// Inside web/src/* - use Bun features
if (typeof Bun !== "undefined") {
  // Use Bun APIs
}

// Outside web/src/* - use Node.js or detect Bun
if (process.versions.bun) {
  // Bun-specific code
}
```
