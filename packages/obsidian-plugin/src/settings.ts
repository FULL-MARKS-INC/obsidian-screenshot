import { App, PluginSettingTab, Setting } from 'obsidian';
import type BrowserCapturePlugin from './main';

export interface BrowserCaptureSettings {
	mcpServerCommand: string;
	captureFolder: string;
}

export const DEFAULT_SETTINGS: BrowserCaptureSettings = {
	mcpServerCommand: 'obsidian-screenshot-mcp',
	captureFolder: 'captures',
};

export class BrowserCaptureSettingTab extends PluginSettingTab {
	plugin: BrowserCapturePlugin;

	constructor(app: App, plugin: BrowserCapturePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Browser Capture Settings' });

		new Setting(containerEl)
			.setName('MCP Server Command')
			.setDesc(
				'The command to run the MCP server. This should be the path to the obsidian-screenshot-mcp executable or a command that starts the MCP server.'
			)
			.addText((text) =>
				text
					.setPlaceholder('obsidian-screenshot-mcp')
					.setValue(this.plugin.settings.mcpServerCommand)
					.onChange(async (value) => {
						this.plugin.settings.mcpServerCommand = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Capture Folder')
			.setDesc(
				'The folder where captured screenshots will be saved. This path is relative to your vault root.'
			)
			.addText((text) =>
				text
					.setPlaceholder('captures')
					.setValue(this.plugin.settings.captureFolder)
					.onChange(async (value) => {
						this.plugin.settings.captureFolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
