import { Plugin } from 'obsidian';

interface ObsidianScreenshotSettings {
	defaultOutputPath: string;
}

const DEFAULT_SETTINGS: ObsidianScreenshotSettings = {
	defaultOutputPath: 'screenshots',
};

export default class ObsidianScreenshotPlugin extends Plugin {
	settings: ObsidianScreenshotSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		console.log('Obsidian Screenshot plugin loaded');
	}

	onunload(): void {
		console.log('Obsidian Screenshot plugin unloaded');
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
