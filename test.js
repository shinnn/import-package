'use strict';

const importPackage = require('.');
const test = require('tape');

test('importPackage', async t => {
	t.equal(
		(await importPackage('unique-slug'))().length,
		8,
		'should import an npm package.'
	);

	try {
		await importPackage(`this-package${(await importPackage('unique-slug'))()}does-not-exist`);
		t.fail('Unexpectedly succeeded.');
	} catch ({code}) {
		t.equal(
			code,
			'MODULE_NOT_FOUND',
			'should fail when it cannot import the module.'
		);
	}

	try {
		await importPackage();
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (<string>), but got no arguments.',
			'should fail when the argument length is not 1.'
		);
	}

	t.end();
});

test('importPackage.preload()', async t => {
	t.ok(
		Array.from({length: 2}, () => importPackage.preload('pacote') === false).every(Boolean),
		'should return false when the module hasn\'t been imported yet.'
	);

	t.equal(
		importPackage.preload('unique-slug'),
		true,
		'should return true when the module has been already imported.'
	);

	try {
		importPackage.preload('a', 'b');
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (<string>), but got 2 arguments.',
			'should fail when the argument length is not 1.'
		);
	}

	t.end();
});
