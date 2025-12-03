import { Editor, Plugin } from 'obsidian';
import { BrowserCaptureSettings, BrowserCaptureSettingTab, DEFAULT_SETTINGS } from './settings';
import { MCPClient } from './mcp-client';
import { CaptureBlockRenderer } from './ui/capture-block';

export default class BrowserCapturePlugin extends Plugin {
	settings: BrowserCaptureSettings = DEFAULT_SETTINGS;
	mcpClient: MCPClient | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

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
			await this.mcpClient.disconnect();
		}
		console.log('Browser Capture plugin unloaded');
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);

		if (this.mcpClient) {
			await this.mcpClient.disconnect();
			this.mcpClient = new MCPClient(this.settings.mcpServerCommand);
		}
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
