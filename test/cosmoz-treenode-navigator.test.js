import { assert, fixture, html } from '@open-wc/testing';
import { DefaultTree } from '@neovici/cosmoz-tree/cosmoz-default-tree';
import basicTree from './data/basicTree.js';
import { flush } from '@polymer/polymer/lib/utils/flush';
import '../cosmoz-treenode-navigator';

suite('cosmoz-treenode-navigator', () => {
	let navigator;

	setup(async () => {
		navigator = await fixture(html`<cosmoz-treenode-navigator .tree=${ new DefaultTree(basicTree) }>`);
		flush();
	});

	test('instantiating the element', () => {
		assert.equal(navigator.tagName, 'COSMOZ-TREENODE-NAVIGATOR');
	});

	test('dataPlane initialised with tree', () => {
		assert.equal(navigator.dataPlane[0].name, 'Root');
		assert.equal(
			navigator.dataPlane.length,
			navigator.tree._roots.length
		);
	});

	test('tree length and sort', () => {
		// given a node navigator with some data

		// when I enter the first node
		navigator.shadowRoot
			.querySelector('#ironList paper-icon-button')
			.click();
		flush();

		// then I can see the contents of the node
		// and it is ordered folder-first, then alphabetically
		assert.equal(navigator.dataPlane[0].name, 'Node2');
		assert.equal(navigator.dataPlane[1].name, 'Node4');
		assert.equal(navigator.dataPlane[2].name, 'Node');
		assert.equal(navigator.dataPlane[3].name, 'Node');
		assert.equal(navigator.dataPlane.length, 4);
	});

	test('match search string', () => {
		// given a node navigator with some data
		// when I search for 'ode2'
		navigator.searchValue = 'ode2';
		flush();

		//then I can see only 1 item matching 'ode2'
		assert.lengthOf(navigator.dataPlane, 1);
		assert.equal(navigator.dataPlane[0].name, 'Node2');

	});

	test('not match search string', () => {
		// given a node navigator with some data
		// when I search for 'NONEXISTING'
		navigator.searchValue = 'NONEXISTING';
		flush();

		//then I can see that is no contents
		assert.lengthOf(navigator.dataPlane, 0);
	});
});
