import { App, MarkdownRenderChild, Notice } from 'obsidian';
import { MCPClient } from '../mcp-client';
import type { BrowserCaptureSettings } from '../settings';

export class CaptureBlockRenderer extends MarkdownRenderChild {
	private app: App;
	private mcpClient: MCPClient;
	private settings: BrowserCaptureSettings;
	private sourcePath: string;
	private launchButton!: HTMLButtonElement;
	private captureButton!: HTMLButtonElement;
	private closeButton!: HTMLButtonElement;

	constructor(
		containerEl: HTMLElement,
		app: App,
		mcpClient: MCPClient,
		settings: BrowserCaptureSettings,
		sourcePath: string
	) {
		super(containerEl);
		this.app = app;
		this.mcpClient = mcpClient;
		this.settings = settings;
		this.sourcePath = sourcePath;
	}

	onload(): void {
		this.render();
	}

	private render(): void {
		const container = this.containerEl.createDiv({
			cls: 'browser-capture-container',
		});

		container.style.display = 'flex';
		container.style.gap = '8px';
		container.style.padding = '8px';
		container.style.backgroundColor = 'var(--background-secondary)';
		container.style.borderRadius = '4px';
		container.style.marginTop = '8px';
		container.style.marginBottom = '8px';

		// Launch Browser button
		this.launchButton = container.createEl('button', {
			text: '🌐',
			cls: 'browser-capture-button browser-capture-launch',
		});
		this.launchButton.setAttribute('aria-label', 'Launch Browser');
		this.launchButton.addEventListener('click', () => this.handleLaunch());

		// Capture button
		this.captureButton = container.createEl('button', {
			text: '📸',
			cls: 'browser-capture-button browser-capture-capture',
		});
		this.captureButton.setAttribute('aria-label', 'Capture Screenshot');
		this.captureButton.addEventListener('click', () => this.handleCapture());

		// Close Browser button
		this.closeButton = container.createEl('button', {
			text: '⏹️',
			cls: 'browser-capture-button browser-capture-close',
		});
		this.closeButton.setAttribute('aria-label', 'Close Browser');
		this.closeButton.addEventListener('click', () => this.handleClose());
	}

	private async handleLaunch(): Promise<void> {
		if (!this.mcpClient.isConnected()) {
			const connectResult = await this.mcpClient.connect();
			if (!connectResult.success) {
				new Notice(`MCP server is not running: ${connectResult.error}`);
				return;
			}
		}

		const result = await this.mcpClient.launchBrowser();
		if (result.success) {
			new Notice(result.message);
		} else {
			new Notice(`Failed to launch browser: ${result.error}`);
		}
	}

	private async handleCapture(): Promise<void> {
		if (!this.mcpClient.isConnected()) {
			new Notice('MCP server is not running. Please launch the browser first.');
			return;
		}

		const result = await this.mcpClient.capturePage();
		if (result.success && result.data) {
			const savedPath = await this.saveCapture(result.data);
			if (savedPath) {
				await this.insertImageLink(savedPath);
				new Notice('Screenshot captured and saved successfully');
			}
		} else {
			new Notice(`Failed to capture screenshot: ${result.error}`);
		}
	}

	private async handleClose(): Promise<void> {
		if (!this.mcpClient.isConnected()) {
			new Notice('MCP server is not running');
			return;
		}

		const result = await this.mcpClient.closeBrowser();
		if (result.success) {
			new Notice(result.message);
		} else {
			new Notice(`Failed to close browser: ${result.error}`);
		}
	}

	private async saveCapture(base64Data: string): Promise<string | null> {
		try {
			const binaryData = this.base64ToArrayBuffer(base64Data);

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `capture-${timestamp}.png`;

			const captureFolder = this.settings.captureFolder;

			const folderExists = this.app.vault.getAbstractFileByPath(captureFolder);
			if (!folderExists) {
				await this.app.vault.createFolder(captureFolder);
			}

			const filePath = `${captureFolder}/${filename}`;

			await this.app.vault.createBinary(filePath, binaryData);

			return filePath;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to save screenshot: ${errorMessage}`);
			return null;
		}
	}

	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}

	private async insertImageLink(imagePath: string): Promise<void> {
		try {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				return;
			}

			const content = await this.app.vault.read(activeFile);
			const lines = content.split('\n');

			let blockStartIndex = -1;
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].trim() === '```browser-capture') {
					blockStartIndex = i;
					break;
				}
			}

			if (blockStartIndex !== -1) {
				const imageLink = `![画面キャプチャ](/${imagePath})`;
				lines.splice(blockStartIndex, 0, imageLink, '');
				const newContent = lines.join('\n');
				await this.app.vault.modify(activeFile, newContent);
			} else {
				new Notice('Could not find browser-capture code block');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to insert image link: ${errorMessage}`);
		}
	}
}
