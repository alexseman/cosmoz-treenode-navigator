import { component, useEffect, useState, useMemo } from 'haunted';
import { html } from 'lit-html';

import '@neovici/cosmoz-input';
import '@neovici/cosmoz-autocomplete';
import { useNotifyProperty } from '@neovici/cosmoz-utils/lib/hooks/use-notify-property';


import {
	computeDataPlane,
	computeRowClass,
	computeSearching, getNode,
	getNodeName, getTreePathParts,
	hasChildren,
	nodeStyles,
	normalizeNodes,
	onNodeDblClicked,
	renderLevel, showGlobalSearchBtn
} from './helpers';

const TreenodeNavigatorNext = (
	{
	/*
			* The main node structure
			*/
		tree,
		/*
						* Placeholder for search field.
						*/
		searchPlaceholder,
		/*
						* Text displayed when local search has finished
						* to suggest a search on the entire tree
						*/
		searchGlobalPlaceholder,
		/*
						* Minimum length of searchValue to trigger a search
						*/
		searchMinLength
	}) => {
	const
		/*
		* The selected node
		*/
		[selectedNode, setSelectedNode] = useState(),
		/*
						* The path of the selected node
						* This is the node which was highlighted and after the user tapped the select button
						*/
		[nodePath, setNodePath] = useState(),
		/*
						* The nodes on the path of the selected node
						*/
		[nodesOnNodePath, setNodesOnNodePath] = useState(),
		/*
						* The path of the opened node
						*/
		[openNodePath, setOpenNodePath] = useState(''),
		/*
						* The nodes on the path of the opened node
						*/
		[nodesOnOpenNodePath, setNodesOnOpenNodePath] = useState([]),
		/*
						* The highlighted (focused) node
						* This is the node which is currently selected in the list
						*/
		[highlightedNode, setHighlightedNode] = useState(),
		/*
						* The path string of highlighted (focused) node
						*/
		[highlightedNodePath, setHighlightedNodePath] = useState(),
		/*
						* The search string
						*/
		[searchValue, setSearchValue] = useState(''),
		/*
						* The currently displayed node list
						*/
		dataPlane = useMemo(() => {
			return computeDataPlane(computeSearching(searchValue, searchMinLength), searchValue, renderLevel(openNodePath, tree), tree);
		}, [tree, openNodePath]),
		openNode = clickedNode => {
			if (hasChildren(clickedNode)) {
				setOpenNodePath(clickedNode.path);
				setSearchValue('');
			}
			if (!clickedNode) {
				setOpenNodePath('');
				setSearchValue('');
				setHighlightedNode(null);
			}

			setNodePath(openNodePath);
			setNodesOnNodePath(getTreePathParts(nodePath, tree));
			setSelectedNode(getNode(nodePath, tree));
		},
		renderSection = (index, parentSectionName) => {
			const _dataPlane = computeDataPlane(computeSearching(searchValue, searchMinLength), searchValue, renderLevel(openNodePath, tree), tree);
			if (!computeSearching(searchValue, searchMinLength) || index == null || _dataPlane == null || index >= _dataPlane.length || parentSectionName == null) {
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
			setHighlightedNodePath('');
			setNodesOnOpenNodePath([]);
			return;
		}
		setNodesOnOpenNodePath(normalizeNodes(tree.getPathNodes(openNodePath)
			.filter(item => item)));
	}, [openNodePath]);


	useEffect(() => {
		if (!highlightedNode) {
			setHighlightedNodePath('');
			return;
		}
		setHighlightedNodePath(highlightedNode.path);
	}, [highlightedNode]);


	useNotifyProperty('selectedNode', selectedNode);
	useNotifyProperty('nodePath', nodePath);
	useNotifyProperty('nodesOnNodePath', nodesOnNodePath);
	useNotifyProperty('highlightedNodePath', highlightedNodePath);

	return html`
		<style>
			:host {
				--cosmoz-treenode-navigator-select-node-icon-color: var(--primary-color, white);
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
				width: 100%;
				position: static;
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
							<svg viewBox="0 0 24 24"
				   preserveAspectRatio="xMidYMid meet"
				   focusable="false"
				   style="pointer-events: none; display: block; width: 100%; height: 100%;">
									<g><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></g>
							</svg>
					</span>
				${ nodesOnOpenNodePath.map(node => {
		return html`
						<span class="slash">/</span>
						<span class="pointer" tabindex="0" @click="${ () => openNode(node) }">${ getNodeName(node) }</span>`;
	}) }
			</h3>
			<cosmoz-input tabindex="0"
						  .value=${ searchValue }
						  .placeholder="${ searchPlaceholder }"
						  @input="${ ({ target }) => setSearchValue(target.value) }"
			/>
		</div>
		${ tree
		? html`
					<cosmoz-listbox
							.query="${ searchValue }"
							.items="${ dataPlane }"
							.textual="${ item => item.name }"
							.itemRenderer=${ (node, index) => html`
								<div class="node-item-wrapper">
									<style>${ nodeStyles }</style>
									${ renderSection(index, node.parentSectionName)
		? html`
												<div class="section">${ node.parentSectionName }</div>`
		: '' }
									<div class="${ computeRowClass('node-item pointer', node === highlightedNode) }"
											 @click="${ () => setHighlightedNode(node) }"
											 @dblclick="${ onNodeDblClicked }">
										<div style="flex: auto">${ node.name }</div>
									${ hasChildren(node)
		? html`
												<span class="icon" @click="${ () => openNode(node) }">
																	<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false"
									   style="pointer-events: none; display: block; width: 100%; height: 100%;">
																		<g>
																			<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
																		</g>
																	</svg>
																</span>`
		: '' }
								</div>
							` }
					></cosmoz-listbox>`
		: '' }
		${ showGlobalSearchBtn(computeSearching(searchValue, searchMinLength), openNodePath)
		? html`
					<button class="btn-ghost" @click="${ () => setOpenNodePath('') }">
						${ searchGlobalPlaceholder }
					</button>`
		: '' }
		`;
};

customElements.define('cosmoz-treenode-navigator-next', component(TreenodeNavigatorNext));
