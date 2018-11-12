'use strict';

const loadFromCwdOrNpm = require('load-from-cwd-or-npm');

const caches = new Map();
const loading = new Map();

function load(moduleId) {
	const unresolvedLoad = loading.get(moduleId);

	if (unresolvedLoad !== undefined) {
		return unresolvedLoad;
	}

	const result = {isRejected: false};
	const promise = (async () => {
		try {
			const loaded = await loadFromCwdOrNpm(moduleId);

			caches.set(moduleId, loaded);
			result.value = loaded;
		} catch (err) {
			result.value = err;
			result.isRejected = true;
		}

		loading.delete(moduleId);

		return result;
	})();

	loading.set(moduleId, promise);

	return promise;
}

function getFirstArgumentWithValidation(args) {
	const argLen = args.length;

	if (argLen !== 1) {
		const error = new RangeError(`Expected 1 argument (<string>), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);

		Error.captureStackTrace(error, getFirstArgumentWithValidation);

		throw error;
	}

	return args[0];
}

module.exports = async function importPackage(...args) {
	const moduleId = getFirstArgumentWithValidation(args);

	if (caches.has(moduleId)) {
		return caches.get(moduleId);
	}

	const {value, isRejected} = await load(moduleId);

	if (isRejected) {
		throw value;
	}

	return value;
};

module.exports.preload = function preloadPackage(...args) {
	const moduleId = getFirstArgumentWithValidation(args);

	if (caches.has(moduleId)) {
		return true;
	}

	load(getFirstArgumentWithValidation(args));

	return false;
};
