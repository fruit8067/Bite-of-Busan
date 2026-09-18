// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: path.resolve(__dirname, 'src/shims/crypto.ts'),
	undici: path.resolve(__dirname, 'src/shims/undici.ts'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === 'crypto') {
		return { filePath: path.resolve(__dirname, 'src/shims/crypto.ts'), type: 'sourceFile' };
	}
	if (moduleName === 'undici') {
		return { filePath: path.resolve(__dirname, 'src/shims/undici.ts'), type: 'sourceFile' };
	}
	return defaultResolveRequest
		? defaultResolveRequest(context, moduleName, platform)
		: context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
