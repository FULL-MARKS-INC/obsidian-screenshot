import { Editor, Plugin } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserCaptureSettings, BrowserCaptureSettingTab, DEFAULT_SETTINGS } from './settings';
import { MCPClient } from './mcp-client';
import { CaptureBlockRenderer } from './ui/capture-block';

export default class BrowserCapturePlugin extends Plugin {
	settings: BrowserCaptureSettings = DEFAULT_SETTINGS;
	mcpClient: MCPClient | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Auto-detect node path if using default command (without full path)
		if (!this.settings.mcpServerCommand.includes('/')) {
			const nodePath = await this.detectNodePath();
			if (nodePath) {
				this.settings.mcpServerCommand = `${nodePath} ${this.settings.mcpServerCommand}`;
				await this.saveData(this.settings);
				console.log(`Using Node.js at: ${nodePath}`);
			}
		}

		this.mcpClient = new MCPClient(this.settings.mcpServerCommand);

		this.addSettingTab(new BrowserCaptureSettingTab(this.app, this));

		this.addCommand({
			id: 'insert-browser-capture-block',
			name: 'Insert Browser Capture Button',
			editorCallback: (editor: Editor) => {
				this.insertCaptureBlock(editor);
			},
		});

		this.registerMarkdownCodeBlockProcessor('browser-capture', (source, el, ctx) => {
			const renderer = new CaptureBlockRenderer(
				el,
				this.app,
				this.mcpClient!,
				this.settings,
				ctx.sourcePath
			);
			ctx.addChild(renderer);
		});

		console.log('Browser Capture plugin loaded');
	}

	async onunload(): Promise<void> {
		if (this.mcpClient) {
			try {
				await this.mcpClient.disconnect();
			} catch (error) {
				console.error('Failed to disconnect MCP client during unload:', error);
			}
		}
		console.log('Browser Capture plugin unloaded');
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		const oldSettings = (await this.loadData()) as BrowserCaptureSettings | null;
		const commandChanged = this.settings.mcpServerCommand !== oldSettings?.mcpServerCommand;

		await this.saveData(this.settings);

		if (commandChanged && this.mcpClient) {
			await this.mcpClient.disconnect();
			this.mcpClient = new MCPClient(this.settings.mcpServerCommand);
		}
	}

	private async detectNodePath(): Promise<string | null> {
		// Try common Node.js installation paths
		const commonPaths = ['/usr/local/bin/node', '/opt/homebrew/bin/node', '/usr/bin/node'];

		for (const nodePath of commonPaths) {
			if (fs.existsSync(nodePath)) {
				return nodePath;
			}
		}

		// Check nvm installations
		const homeDir = process.env.HOME || process.env.USERPROFILE;
		if (homeDir) {
			const nvmDir = path.join(homeDir, '.nvm', 'versions', 'node');
			if (fs.existsSync(nvmDir)) {
				try {
					const versions = fs.readdirSync(nvmDir);
					if (versions.length > 0) {
						// Use the latest version (sort by version number)
						versions.sort().reverse();
						const latestVersion = versions[0];
						const nvmNodePath = path.join(nvmDir, latestVersion, 'bin', 'node');
						if (fs.existsSync(nvmNodePath)) {
							return nvmNodePath;
						}
					}
				} catch (error) {
					console.error('Error detecting nvm node path:', error);
				}
			}
		}

		return null;
	}

	private insertCaptureBlock(editor: Editor): void {
		const cursor = editor.getCursor();
		const codeBlock = '```browser-capture\n```\n';
		editor.replaceRange(codeBlock, cursor);

		const newCursor = {
			line: cursor.line + 3,
			ch: 0,
		};
		editor.setCursor(newCursor);
	}
}
