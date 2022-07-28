import { component, useEffect, useState, useMemo, useCallback } from 'haunted';
import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import '@neovici/cosmoz-input';
import { useMeta } from '@neovici/cosmoz-utils/hooks/use-meta';
import { notifyProperty } from '@neovici/cosmoz-utils/hooks/use-notify-property';

import {
	computeDataPlane,
	computeRowClass,
	computeSearching,
	normalizeNodes,
	onNodeDblClicked,
	renderLevel,
	showGlobalSearchBtn,
} from './helpers';
import styles from './cosmoz-treenode-navigator.styles';

const TreenodeNavigator = (host) => {
	const {
			/**
			 * The main node structure
			 */
			tree,
			/**
			 * Placeholder for search field.
			 */
			searchPlaceholder,
			/**
			 * Text displayed when local search has finished
			 * to suggest a search on the entire tree
			 */
			searchGlobalPlaceholder,
			/**
			 * Minimum length of searchValue to trigger a search
			 */
			searchMinLength,
			nodePath,
		} = host,
		/**
		 * The path of the opened node
		 */
		[openNodePath, setOpenNodePath] = useState(''),
		/**
		 * The nodes on the path of the opened node
		 */
		nodesOnOpenNodePath = useMemo(
			() =>
				openNodePath
					? normalizeNodes(
							tree,
							tree.getPathNodes(openNodePath).filter((item) => item)
					  )
					: [],
			[tree, openNodePath]
		),
		/**
		 * The highlighted (focused) node
		 * This is the node which is currently selected in the list
		 */
		[highlightedNode, setHighlightedNode] = useState(),
		/**
		 * The search string
		 */
		[searchValue, setSearchValue] = useState(''),
		isSearching = useMemo(
			() => computeSearching(searchValue, searchMinLength),
			[searchValue, searchMinLength]
		),
		renderedLevel = useMemo(
			() => renderLevel(openNodePath, tree),
			[openNodePath, tree]
		),
		/**
		 * The currently displayed node list
		 */
		dataPlane = useMemo(
			() => computeDataPlane(isSearching, searchValue, renderedLevel, tree),
			[isSearching, searchValue, renderedLevel, tree]
		),
		/**
		 * Opens a node (renderLevel) based on a given path
		 * @param {object} clickedNode - The clicked node
		 * @return {undefined}
		 */
		openNode = useCallback(
			(clickedNode) => {
				if (tree.hasChildren(clickedNode)) {
					setOpenNodePath(clickedNode.path);
					setSearchValue('');
				}
				if (!clickedNode) {
					setOpenNodePath('');
					setSearchValue('');
					setHighlightedNode(null);
				}
			},
			[tree]
		),
		/**
		 * Returns true, if the path of a node should be visible in the view
		 * @param {Number} index - The node's current index in the list
		 * @param {Object} parentSectionName - The nodes current parent section name
		 * @return {Boolean} - If the path should be visible
		 */
		renderSection = useCallback(
			(index, parentSectionName) => {
				if (
					!isSearching ||
					index == null ||
					dataPlane == null ||
					index >= dataPlane.length ||
					parentSectionName == null
				) {
					return false;
				}
				if (index === 0) {
					return true;
				}
				const prevItem = dataPlane[index - 1];
				return prevItem.parentSectionName !== parentSectionName;
			},
			[isSearching, dataPlane]
		);

	useEffect(() => {
		if (!openNodePath) {
			notifyProperty(host, 'highlightedNodePath', '');
			notifyProperty(host, 'nodesOnNodePath', []);
		}
	}, [openNodePath]);

	useEffect(() => {
		if (nodePath !== undefined) {
			host.dispatchEvent(
				new CustomEvent('select-node', {
					detail: {},
				})
			);
		}
	}, [nodePath]);

	useEffect(() => {
		notifyProperty(host, 'highlightedNodePath', highlightedNode?.path || '');
	}, [highlightedNode]);

	const meta = useMeta({ dataPlane, highlightedNode, openNode });

	useEffect(() => {
		const handler = (e) => {
			if ((e.ctrlKey && e.altKey) || e.defaultPrevented) {
				return;
			}
			const { dataPlane: items, highlightedNode: node, openNode: open } = meta;
			switch (e.key) {
				case 'Up':
				case 'ArrowUp':
					{
						const idx = items.findIndex((i) => i.path === node?.path);
						e.preventDefault();
						setHighlightedNode(items[Math.max(idx - 1, 0)]);
					}
					break;
				case 'Down':
				case 'ArrowDown':
					{
						const idx = items.findIndex((i) => i.path === node?.path);
						if (idx < items.length - 1) {
							e.preventDefault();
							setHighlightedNode(items[idx + 1]);
						}
					}
					break;
				case 'Enter':
					if (node) {
						e.preventDefault();
						open(node);
					}
					break;
				default:
					break;
			}
		};

		document.addEventListener('keydown', handler, true);
		return () => document.removeEventListener('keydown', handler, true);
	}, [meta]);

	const renderItem = (node, index) => html` <div class="item">
		${when(
			renderSection(index, node.parentSectionName),
			() => html` <div class="section">${node.parentSectionName}</div> `
		)}
		<div
			class=${computeRowClass('node', node, highlightedNode)}
			@click=${() => setHighlightedNode(node)}
			@dblclick=${(e) => onNodeDblClicked(e, host)}
		>
			<div class="name">${node.name}</div>
			${when(
				tree.hasChildren(node),
				() => html`
					<span class="icon" @click=${() => openNode(node)}>
						<svg
							viewBox="0 0 24 24"
							preserveAspectRatio="xMidYMid meet"
							focusable="false"
							style="pointer-events: none; display: block; width: 100%; height: 100%;"
						>
							<g>
								<path
									d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
								></path>
							</g>
						</svg>
					</span>
				`
			)}
		</div>
	</div>`;

	return html`
		<style>
			${styles}
		</style>
		<div class="header">
			<h3 class="path">
				<span class="icon" @click=${() => openNode()}>
					<svg
						viewBox="0 0 24 24"
						preserveAspectRatio="xMidYMid meet"
						focusable="false"
						style="pointer-events: none; display: block; width: 100%; height: 100%;"
					>
						<g><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></g>
					</svg>
				</span>
				${nodesOnOpenNodePath.map((node) => {
					return html` <span class="slash">/</span>
						<span class="pointer" tabindex="0" @click=${() => openNode(node)}
							>${node[tree.searchProperty]}</span
						>`;
				})}
			</h3>
			<cosmoz-input
				tabindex="0"
				.value=${searchValue}
				.placeholder=${searchPlaceholder}
				@input=${(e) => setSearchValue(e.target.value)}
			/>
		</div>
		${when(
			tree,
			() => html` <div class="items">
				<div virtualizer-sizer></div>
				${virtualize({ items: dataPlane, renderItem, scroller: true })}
			</div>`
		)}
		${when(
			showGlobalSearchBtn(isSearching, openNodePath),
			() => html`
				<button class="btn-ghost" @click=${() => setOpenNodePath('')}>
					${searchGlobalPlaceholder}
				</button>
			`
		)}
	`;
};

customElements.define(
	'cosmoz-treenode-navigator',
	component(TreenodeNavigator)
);
