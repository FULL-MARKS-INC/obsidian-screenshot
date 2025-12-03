# Obsidian Screenshot

Capture browser screenshots directly from Obsidian notes using Playwright automation.

## Features

- Capture screenshots of web pages directly from your Obsidian notes
- Powered by Playwright for reliable browser automation
- Desktop-only plugin

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Obsidian Screenshot"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/FULL-MARKS-INC/obsidian-screenshot/releases) page
2. Extract the files to your vault's `.obsidian/plugins/obsidian-screenshot/` folder
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Usage

Documentation for usage will be added as features are implemented.

## Development

### Prerequisites

- Node.js 20 or later
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/FULL-MARKS-INC/obsidian-screenshot.git
cd obsidian-screenshot

# Install dependencies
npm install

# Build the plugin
npm run build

# Start development mode (watch for changes)
npm run dev
```

### Available Scripts

| Script                 | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start development mode with file watching |
| `npm run build`        | Build the plugin for production           |
| `npm run lint`         | Run ESLint                                |
| `npm run lint:fix`     | Run ESLint with auto-fix                  |
| `npm run format`       | Format code with Prettier                 |
| `npm run format:check` | Check code formatting                     |

### Code Quality

This project uses:

- **TypeScript** for type-safe code
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for running linters on staged files

Pre-commit hooks automatically run linting and formatting on staged files.

### Testing in Obsidian

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-screenshot/` folder
3. Reload Obsidian and enable the plugin

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Obsidian](https://obsidian.md/) for the amazing note-taking app
- [Playwright](https://playwright.dev/) for browser automation
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) for the plugin template
