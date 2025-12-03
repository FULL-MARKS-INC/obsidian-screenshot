#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
	const { server, browserManager } = createServer();
	const transport = new StdioServerTransport();

	await server.connect(transport);

	process.on('SIGINT', async () => {
		try {
			if (browserManager.hasActiveSession()) {
				await browserManager.close();
			}
		} catch (error) {
			console.error('Failed to close browser:', error);
		}
		await server.close();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		try {
			if (browserManager.hasActiveSession()) {
				await browserManager.close();
			}
		} catch (error) {
			console.error('Failed to close browser:', error);
		}
		await server.close();
		process.exit(0);
	});
}

main().catch((error) => {
	console.error('Failed to start MCP server:', error);
	process.exit(1);
});
