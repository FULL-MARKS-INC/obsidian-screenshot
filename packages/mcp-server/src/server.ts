import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserSessionManager } from './browser.js';

export function createServer(): McpServer {
	const server = new McpServer(
		{
			name: 'obsidian-screenshot-mcp',
			version: '0.1.0',
		},
		{
			capabilities: {
				tools: {},
			},
		}
	);

	const browserManager = new BrowserSessionManager();

	server.registerTool(
		'browser_launch',
		{
			description:
				'Launch a new browser session with Chromium. The browser will open in non-headless mode for visual interaction.',
		},
		async () => {
			try {
				await browserManager.launch();
				return {
					content: [
						{
							type: 'text',
							text: 'Browser launched successfully. You can now navigate to pages and capture screenshots.',
						},
					],
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				return {
					content: [
						{
							type: 'text',
							text: `Failed to launch browser: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		}
	);

	server.registerTool(
		'browser_capture',
		{
			description:
				'Capture a full-page screenshot of the current browser page. Returns the screenshot as a base64-encoded PNG image.',
		},
		async () => {
			try {
				const base64Image = await browserManager.capture();
				return {
					content: [
						{
							type: 'image',
							data: base64Image,
							mimeType: 'image/png',
						},
					],
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				return {
					content: [
						{
							type: 'text',
							text: `Failed to capture screenshot: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		}
	);

	server.registerTool(
		'browser_close',
		{
			description: 'Close the current browser session and release all resources.',
		},
		async () => {
			try {
				await browserManager.close();
				return {
					content: [
						{
							type: 'text',
							text: 'Browser closed successfully.',
						},
					],
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				return {
					content: [
						{
							type: 'text',
							text: `Failed to close browser: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		}
	);

	return server;
}
