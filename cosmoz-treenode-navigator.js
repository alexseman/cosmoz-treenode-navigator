import { component, useEffect, useState, useMemo, useCallback } from 'haunted';
import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';

import '@neovici/cosmoz-input';
import '@neovici/cosmoz-autocomplete';
import { notifyProperty } from '@neovici/cosmoz-utils/hooks/use-notify-property';

import {
	computeDataPlane,
	computeRowClass,
	computeSearching,
	getNodeName,
	hasChildren,
	nodeStyles,
	normalizeNodes,
	onNodeDblClicked,
	renderLevel,
	showGlobalSearchBtn
} from './helpers';

const TreenodeNavigator = host => {
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
			nodePath
		} = host,
		/**
		 * The path of the opened node
		 */
		[openNodePath, setOpenNodePath] = useState(''),
		/**
		 * The nodes on the path of the opened node
		 */
		[nodesOnOpenNodePath, setNodesOnOpenNodePath] = useState([]),
		/**
		 * The highlighted (focused) node
		 * This is the node which is currently selected in the list
		 */
		[highlightedNode, setHighlightedNode] = useState(),
		/**
		 * The search string
		 */
		[searchValue, setSearchValue] = useState(''),
		/**
		 * The currently displayed node list
		 */
		dataPlane = useMemo(() => {
			return computeDataPlane(
				computeSearching(searchValue, searchMinLength),
				searchValue,
				renderLevel(openNodePath, tree),
				tree
			);
		}, [tree, openNodePath, highlightedNode, searchValue]),
		/**
		 * Opens a node (renderLevel) based on a given path
		 * @param {object} clickedNode - The clicked node
		 * @return {undefined}
		 */
		openNode = useCallback(clickedNode => {
			if (hasChildren(clickedNode)) {
				setOpenNodePath(clickedNode.path);
				setSearchValue('');
			}
			if (!clickedNode) {
				setOpenNodePath('');
				setSearchValue('');
				setHighlightedNode(null);
			}
		}, []),
		/**
		 * Returns true, if the path of a node should be visible in the view
		 * @param {Number} index - The node's current index in the list
		 * @param {Object} parentSectionName - The nodes current parent section name
		 * @return {Boolean} - If the path should be visible
		 */
		renderSection = (index, parentSectionName) => {
			const _dataPlane = computeDataPlane(
				computeSearching(searchValue, searchMinLength),
				searchValue,
				renderLevel(openNodePath, tree),
				tree
			);
			if (
				!computeSearching(searchValue, searchMinLength) ||
				index == null ||
				_dataPlane == null ||
				index >= _dataPlane.length ||
				parentSectionName == null
			) {
				return false;
			}
			if (index === 0) {
				return true;
			}
			const prevItem = _dataPlane[index - 1];
			return prevItem.parentSectionName !== parentSectionName;
		};

	useEffect(() => {
		if (!openNodePath) {
			notifyProperty(host, 'highlightedNodePath', '');
			notifyProperty(host, 'nodesOnNodePath', []);
			return;
		}
		setNodesOnOpenNodePath(
			normalizeNodes(tree.getPathNodes(openNodePath).filter(item => item))
		);
	}, [openNodePath]);

	useEffect(() => {
		if (!openNodePath) {
			notifyProperty(host, 'highlightedNodePath', '');
			return;
		}
		setNodesOnOpenNodePath(
			normalizeNodes(tree.getPathNodes(openNodePath).filter(item => item))
		);
	}, [openNodePath]);

	useEffect(() => {
		if (nodePath !== undefined) {
			host.dispatchEvent(
				new CustomEvent('select-node', {
					detail: {}
				})
			);
		}
	}, [nodePath]);

	useEffect(() => {
		notifyProperty(
			host,
			'highlightedNodePath',
			!highlightedNode ? '' : highlightedNode.path
		);
	}, [highlightedNode]);

	return html`
		<style>
			:host {
				--cosmoz-treenode-navigator-select-node-icon-color: var(
					--primary-color,
					white
				);
				--cosmoz-treenode-navigator-list-item-focused-color: #f0f8ff;
			}

			#header {
				margin: 0 16px;
			}

			#header a {
				text-decoration: none;
				color: inherit;
			}

			.icon {
				display: inline-block;
				position: relative;
				padding: 8px;
				outline: none;
				user-select: none;
				cursor: pointer;
				z-index: 0;
				line-height: 1;
				width: 40px;
				height: 40px;
				box-sizing: border-box;
			}

			.path {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
			}

			.slash {
				margin: 0 2px;
			}

			.pointer {
				cursor: pointer;
			}

			cosmoz-listbox {
				box-shadow: none;
				display: block;
				height: var(--cosmoz-treenode-navigator-list-height, 50vh);
				position: static;
				width: 100%;
			}

			.btn-ghost {
				background: transparent;
				border: none;
				cursor: pointer;
				margin: 0 0.29em;
				padding: 0.7em 0.57em;
				text-transform: uppercase;
			}
		</style>
		<div id="header">
			<h3 class="path">
				<span class="icon" @click=${ () => openNode() }>
					<svg
						viewBox="0 0 24 24"
						preserveAspectRatio="xMidYMid meet"
						focusable="false"
						style="pointer-events: none; display: block; width: 100%; height: 100%;"
					>
						<g><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></g>
					</svg>
				</span>
				${ nodesOnOpenNodePath.map(node => {
		return html` <span class="slash">/</span>
						<span class="pointer" tabindex="0" @click="${ () => openNode(node) }"
							>${ getNodeName(node) }</span
						>`;
	}) }
			</h3>
			<cosmoz-input
				tabindex="0"
				.value=${ searchValue }
				.placeholder="${ searchPlaceholder }"
				.label="${ searchPlaceholder }"
				@input="${ ({ target }) => setSearchValue(target.value) }"
			/>
		</div>
		${ when(
		tree,
		() => html`
			<cosmoz-listbox
					.query="${ searchValue }"
					.items="${ dataPlane }"
					.textual="${ item => item.name }"
					.itemRenderer=${ (node, index) => html`
						<div class="node-item-wrapper">
							<style>
								${ nodeStyles }
							</style>
							${ when(
		renderSection(index, node.parentSectionName),
		() => html`
									<div class="section">${ node.parentSectionName }</div>
								`
	) }
							<div
								class="${ computeRowClass(
		'node-item pointer',
		node,
		highlightedNode
	) }"
								@click="${ () => setHighlightedNode(node) }"
								@dblclick="${ e => onNodeDblClicked(e, host) }"
							>
								<div style="flex: auto">${ node.name }</div>
								${ when(
		hasChildren(node),
		() => html`
										<span class="icon" @click="${ () => openNode(node) }">
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
	) }
							</div>
						</div>
					` }
			</cosmoz-listbox>`
	) }
		${ when(
		showGlobalSearchBtn(
			computeSearching(searchValue, searchMinLength),
			openNodePath
		),
		() => html`
				<button class="btn-ghost" @click="${ () => setOpenNodePath('') }">
					${ searchGlobalPlaceholder }
				</button>
			`
	) }
	`;
};

customElements.define(
	'cosmoz-treenode-navigator',
	component(TreenodeNavigator)
);
