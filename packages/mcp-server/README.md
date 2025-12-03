# Obsidian Screenshot MCP Server

A Model Context Protocol (MCP) server that provides browser session management and screenshot capture functionality using Playwright.

## Features

- Launch a Chromium browser in non-headless mode for visual interaction
- Capture full-page screenshots as base64-encoded PNG images
- Close browser sessions and release resources

## Installation

### Prerequisites

- Node.js 20 or later
- npm

### Setup

From the repository root:

```bash
# Install dependencies
npm install

# Build the MCP server
npm run build:mcp-server

# Install Playwright browsers (required for first-time setup)
npx playwright install chromium
```

## Usage

### Available Tools

The MCP server provides three tools:

| Tool              | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `browser_launch`  | Launch a new browser session with Chromium in non-headless mode |
| `browser_capture` | Capture a full-page screenshot of the current browser page      |
| `browser_close`   | Close the current browser session and release resources         |

### Configuration with Kiro

Add the following to your `.kiro/settings/mcp.json`:

```json
{
	"mcpServers": {
		"obsidian-screenshot": {
			"command": "node",
			"args": ["/path/to/obsidian-screenshot/packages/mcp-server/dist/index.js"]
		}
	}
}
```

### Configuration with Claude Desktop

Add the following to your Claude Desktop configuration:

```json
{
	"mcpServers": {
		"obsidian-screenshot": {
			"command": "node",
			"args": ["/path/to/obsidian-screenshot/packages/mcp-server/dist/index.js"]
		}
	}
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Directly

```bash
npm run start
```

## Technical Details

- Uses Playwright for browser automation
- Communicates via stdio using the MCP protocol
- Screenshots are returned as base64-encoded PNG images

## License

MIT
