# Obsidian Screenshot

Capture browser screenshots directly from Obsidian notes using Playwright automation via Model Context Protocol (MCP).

## Overview

This monorepo contains two packages that work together to enable browser screenshot capture from within Obsidian:

- **MCP Server** (`packages/mcp-server`): A command-line server that controls a Playwright browser and exposes screenshot functionality via the Model Context Protocol.
- **Obsidian Plugin** (`packages/obsidian-plugin`): A desktop-only Obsidian plugin that provides a user interface for launching browsers, capturing screenshots, and inserting them into your notes.

The plugin spawns the MCP server as a child process and communicates with it over stdio. Screenshots are saved locally to your vault and linked using Obsidian's wiki-link syntax.

## Features

- **Browser Control**: Launch and manage a Chromium browser directly from your notes
- **One-Click Capture**: Take full-page screenshots with a single button click
- **Automatic Linking**: Screenshots are saved to your vault and automatically linked above the capture block
- **Local Processing**: Everything runs on your machine—no external services or uploads
- **Configurable**: Customize the MCP server command and screenshot save location

## Quick Start

If you just want to use the plugin, follow these steps:

### Prerequisites

- Node.js 20 or later
- Obsidian desktop app (Windows, macOS, or Linux)
- Chromium browser (installed automatically by Playwright)

### Installation

```bash
# Clone and install
git clone https://github.com/FULL-MARKS-INC/obsidian-screenshot.git
cd obsidian-screenshot
npm install

# Build the MCP server
npm run build:mcp-server

# Make the MCP server globally accessible (recommended)
npm link -w packages/mcp-server

# Verify installation
obsidian-screenshot-mcp --version

# Build the Obsidian plugin
npm run build -w packages/obsidian-plugin
```

### Install Plugin in Obsidian

1. Create the plugin folder in your vault:

   ```bash
   mkdir -p <your-vault>/.obsidian/plugins/browser-capture
   ```

2. Copy the plugin files:

   ```bash
   cp packages/obsidian-plugin/dist/main.js <your-vault>/.obsidian/plugins/browser-capture/
   cp packages/obsidian-plugin/manifest.json <your-vault>/.obsidian/plugins/browser-capture/
   ```

3. Enable the plugin:
   - Open Obsidian Settings → Community Plugins
   - Disable Safe Mode if prompted
   - Find "Browser Capture" and toggle it ON

4. Configure settings (Settings → Browser Capture):
   - **MCP Server Command**: `obsidian-screenshot-mcp` (or full path if not linked globally)
   - **Capture Folder**: `captures` (default, relative to vault root)

## Usage

### Inserting a Capture Block

Use the command palette (Cmd/Ctrl+P) and search for "Browser Capture: Insert Browser Capture Button", or manually add a code block to your note:

````markdown
```browser-capture

```
````

### Capture Workflow

The code block renders three buttons:

1. **Launch Browser** – Opens a Chromium browser window and connects to the MCP server
2. **Capture** – Takes a screenshot of the current page and inserts a link above the code block
3. **Close Browser** – Closes the browser window

A typical workflow:

1. Insert a `browser-capture` block in your note
2. Click "Launch Browser"
3. Navigate to the page you want to capture
4. Click "Capture" (repeat as needed for multiple screenshots)
5. Click "Close Browser" when finished

### Result

After capturing, your note will look like this:

````markdown
![[captures/capture-2025-12-03T12-34-56-789Z.png]]

```browser-capture

```
````

````

The screenshot is saved to your configured capture folder with a timestamp-based filename.

## Development

For contributors and developers who want to modify the code:

### Setup

```bash
git clone https://github.com/FULL-MARKS-INC/obsidian-screenshot.git
cd obsidian-screenshot
npm install
````

### Available Scripts

| Script                                      | Description                               |
| ------------------------------------------- | ----------------------------------------- |
| `npm run build`                             | Build all packages (type-check + bundle)  |
| `npm run build:mcp-server`                  | Build MCP server only                     |
| `npm run build -w packages/obsidian-plugin` | Build Obsidian plugin only                |
| `npm run deploy:plugin`                     | Build and deploy plugin to Obsidian vault |
| `npm run dev`                               | Start development mode with file watching |
| `npm run lint`                              | Run ESLint on all packages                |
| `npm run lint:fix`                          | Run ESLint with auto-fix                  |
| `npm run format`                            | Format code with Prettier                 |
| `npm run format:check`                      | Check code formatting                     |

### Quick Deploy to Obsidian Vault

The `deploy:plugin` script builds the plugin and copies it directly to your Obsidian vault. Set the `VAULT_PATH` environment variable to your vault's root directory:

```bash
# Set your vault path (adjust to your environment)
export VAULT_PATH="/path/to/your/obsidian-vault"

# Build and deploy in one command
npm run deploy:plugin
```

You can add the export to your shell profile (`.bashrc`, `.zshrc`, etc.) to make it persistent across terminal sessions.

### Testing Locally

1. Build and link the MCP server:

   ```bash
   npm run build:mcp-server
   npm link -w packages/mcp-server
   ```

2. Build the plugin in watch mode:

   ```bash
   npm run dev -w packages/obsidian-plugin
   ```

3. Set up a test vault:

   ```bash
   mkdir -p test-vault/.obsidian/plugins/browser-capture
   ln -s $(pwd)/packages/obsidian-plugin/dist/main.js test-vault/.obsidian/plugins/browser-capture/
   ln -s $(pwd)/packages/obsidian-plugin/manifest.json test-vault/.obsidian/plugins/browser-capture/
   ```

4. Open the test vault in Obsidian and enable the plugin.

## Troubleshooting

### "MCP server is not running"

The plugin cannot connect to the MCP server. Check that:

- `obsidian-screenshot-mcp` is in your PATH (run `which obsidian-screenshot-mcp` to verify)
- Or use the full path in plugin settings, e.g., `/path/to/obsidian-screenshot/packages/mcp-server/dist/index.js`

### Browser doesn't launch

Playwright may need to install browser binaries:

```bash
npx playwright install chromium
```

### Screenshots not saving

Verify the capture folder exists and is writable. The plugin creates the folder automatically, but permission issues may prevent this.

### Debugging

- **Obsidian console**: View → Toggle Developer Tools (Cmd/Ctrl+Shift+I) → Console tab
- **MCP server logs**: Run `obsidian-screenshot-mcp` manually in a terminal to see server output

## Architecture

The plugin uses the Model Context Protocol (MCP) to communicate with a local server:

```
┌─────────────────────┐     stdio      ┌─────────────────────┐
│   Obsidian Plugin   │ ◄────────────► │     MCP Server      │
│   (MCPClient)       │                │  (Playwright)       │
└─────────────────────┘                └─────────────────────┘
         │                                       │
         │ Obsidian API                          │ Browser Control
         ▼                                       ▼
    Save to Vault                         Chromium Browser
```

The MCP server exposes three tools:

- `browser_launch`: Start a new browser session
- `browser_capture`: Take a screenshot and return base64-encoded image data
- `browser_close`: Close the browser session

## Code Quality

This project uses:

- **TypeScript** for type-safe code
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for running linters on staged files

Pre-commit hooks automatically run linting and formatting on staged files.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Obsidian](https://obsidian.md/) for the amazing note-taking app
- [Playwright](https://playwright.dev/) for browser automation
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP architecture
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) for the plugin template
