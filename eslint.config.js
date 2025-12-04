import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				process: 'readonly',
				HTMLElement: 'readonly',
				atob: 'readonly',
				Uint8Array: 'readonly',
				ArrayBuffer: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-console': 'off',
		},
	},
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'**/dist/**',
			'**/*.js',
			'!eslint.config.js',
			'!esbuild.config.mjs',
		],
	},
];
