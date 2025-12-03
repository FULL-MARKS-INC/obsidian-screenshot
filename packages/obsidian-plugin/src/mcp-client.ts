import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface CaptureResult {
	success: boolean;
	data?: string;
	error?: string;
}

export interface OperationResult {
	success: boolean;
	message: string;
	error?: string;
}

export class MCPClient {
	private client: Client | null = null;
	private transport: StdioClientTransport | null = null;
	private connected = false;
	private mcpServerCommand: string;

	constructor(mcpServerCommand: string) {
		this.mcpServerCommand = mcpServerCommand;
	}

	async connect(): Promise<OperationResult> {
		if (this.connected) {
			return { success: true, message: 'Already connected to MCP server' };
		}

		try {
			const [command, ...args] = this.mcpServerCommand.split(' ');

			this.transport = new StdioClientTransport({
				command,
				args,
			});

			this.client = new Client(
				{
					name: 'obsidian-browser-capture',
					version: '0.1.0',
				},
				{
					capabilities: {},
				}
			);

			await this.client.connect(this.transport);
			this.connected = true;

			return { success: true, message: 'Connected to MCP server' };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return {
				success: false,
				message: 'Failed to connect to MCP server',
				error: errorMessage,
			};
		}
	}

	async disconnect(): Promise<void> {
		if (this.client) {
			try {
				await this.client.close();
			} catch {
				// Ignore errors during disconnect
			}
		}
		this.client = null;
		this.transport = null;
		this.connected = false;
	}

	isConnected(): boolean {
		return this.connected;
	}

	async launchBrowser(): Promise<OperationResult> {
		if (!this.client || !this.connected) {
			return {
				success: false,
				message: 'Not connected to MCP server',
				error: 'MCP server is not running',
			};
		}

		try {
			const result = await this.client.callTool({
				name: 'browser_launch',
				arguments: {},
			});

			if ('isError' in result && result.isError) {
				const errorContent = result.content.find(
					(c): c is { type: 'text'; text: string } => c.type === 'text'
				);
				return {
					success: false,
					message: 'Failed to launch browser',
					error: errorContent?.text || 'Unknown error',
				};
			}

			const textContent = result.content.find(
				(c): c is { type: 'text'; text: string } => c.type === 'text'
			);
			return {
				success: true,
				message: textContent?.text || 'Browser launched successfully',
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return {
				success: false,
				message: 'Failed to launch browser',
				error: errorMessage,
			};
		}
	}

	async capturePage(): Promise<CaptureResult> {
		if (!this.client || !this.connected) {
			return {
				success: false,
				error: 'MCP server is not running',
			};
		}

		try {
			const result = await this.client.callTool({
				name: 'browser_capture',
				arguments: {},
			});

			if ('isError' in result && result.isError) {
				const errorContent = result.content.find(
					(c): c is { type: 'text'; text: string } => c.type === 'text'
				);
				return {
					success: false,
					error: errorContent?.text || 'Unknown error',
				};
			}

			const imageContent = result.content.find(
				(c): c is { type: 'image'; data: string; mimeType: string } => c.type === 'image'
			);

			if (imageContent) {
				return {
					success: true,
					data: imageContent.data,
				};
			}

			return {
				success: false,
				error: 'No image data received',
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	async closeBrowser(): Promise<OperationResult> {
		if (!this.client || !this.connected) {
			return {
				success: false,
				message: 'Not connected to MCP server',
				error: 'MCP server is not running',
			};
		}

		try {
			const result = await this.client.callTool({
				name: 'browser_close',
				arguments: {},
			});

			if ('isError' in result && result.isError) {
				const errorContent = result.content.find(
					(c): c is { type: 'text'; text: string } => c.type === 'text'
				);
				return {
					success: false,
					message: 'Failed to close browser',
					error: errorContent?.text || 'Unknown error',
				};
			}

			const textContent = result.content.find(
				(c): c is { type: 'text'; text: string } => c.type === 'text'
			);
			return {
				success: true,
				message: textContent?.text || 'Browser closed successfully',
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return {
				success: false,
				message: 'Failed to close browser',
				error: errorMessage,
			};
		}
	}
}
