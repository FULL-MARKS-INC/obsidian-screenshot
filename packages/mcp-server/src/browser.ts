import { chromium, Browser, BrowserContext, Page } from 'playwright';

export class BrowserSessionManager {
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private page: Page | null = null;

	async launch(): Promise<void> {
		if (this.browser) {
			throw new Error(
				'Browser session already exists. Close the current session before launching a new one.'
			);
		}

		this.browser = await chromium.launch({
			headless: false,
		});
		this.context = await this.browser.newContext();
		this.page = await this.context.newPage();
	}

	async capture(): Promise<string> {
		if (!this.page) {
			throw new Error('No active browser session. Launch a browser first.');
		}

		const screenshot = await this.page.screenshot({
			fullPage: true,
			type: 'png',
		});

		return screenshot.toString('base64');
	}

	async close(): Promise<void> {
		if (!this.browser) {
			throw new Error('No active browser session to close.');
		}

		try {
			await this.browser.close();
		} finally {
			this.browser = null;
			this.context = null;
			this.page = null;
		}
	}

	hasActiveSession(): boolean {
		return this.browser !== null;
	}

	getPage(): Page | null {
		return this.page;
	}
}
