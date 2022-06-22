import { component, useEffect, useState } from 'haunted';
import { html } from 'lit-html';

import '@neovici/cosmoz-input';
import '@neovici/cosmoz-autocomplete';
import { computeDataPlane, computeRowClass, computeSearching, hasChildren, normalizeNodes, onNodeDblClicked, renderLevel } from './helpers';
import { DefaultTree } from '@neovici/cosmoz-tree/cosmoz-default-tree';
import basicTree from './test/data/basicTree';

const TreenodeNavigatorNext = () => {
	const
		/*
				* The currently displayed node list
				*/
		[dataPlane, setDataPlane] = useState(),
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
				* Minimum length of searchValue to trigger a search
				*/
		[searchMinLength, setSearchMinLength] = useState(1),
		/*
				* Placeholder for search field.
				*/
		[searchPlaceholder, setSearchPlaceholder] = useState('Search'),
		/*
				* Text displayed when local search has finished
				* to suggest a search on the entire tree
				*/
		[searchGlobalPlaceholder, setSearchGlobalPlaceholder] = useState('Click to search again but globally.'),
		/*
				* The main node structure
				*/
		tree = new DefaultTree(basicTree),
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
		},
		renderSection = (index, dataPlane, parentSectionName) => {
			if (!computeSearching(searchValue, searchMinLength) || index == null || dataPlane == null || index >= dataPlane.length || parentSectionName == null) {
				return false;
			}
			if (index === 0) {
				return true;
			}
			const prevItem = dataPlane[index - 1];
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
		setHighlightedNodePath(openNodePath);
	}, [highlightedNode]);

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
						<span class="pointer" tabindex="0" @click="${ () => openNode(node) }">${ node.path }</span>`;
	}) }
			</h3>
			<cosmoz-input tabindex="0"
						  .value=${ searchValue }
						  .placeholder="${ searchPlaceholder }"
						  @input="${ ({ target }) => setSearchValue(target.value) }"
			/>
		</div>
		<cosmoz-listbox
				.query="${ searchValue }"
				.items="${ computeDataPlane(computeSearching(searchValue, searchMinLength), searchValue, renderLevel(openNodePath, tree), tree) }"
				.textual=${ (node, index) => html`
			<style>
				.item {
					padding: 0;
				}

				.item[data-index] {
					background: transparent;
				}

				.node-item {
					font-family: 'Roboto', 'Noto', sans-serif;
					padding: 6px 12px;
					font-size: 16px;
					font-weight: 400;
					line-height: 24px;
					height: 28px;
					display: flex;
					align-items: center;
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

				.node-item.selected {
					transition: background-color 0.2s ease-out;
					background-color: var(--cosmoz-listbox-active-color, var(--cosmoz-selection-color, rgba(58, 145, 226, 0.1)));
				}

				.node-item.selected .icon svg {
					transition: color 0.8s ease-out;
					fill: var(--cosmoz-treenode-navigator-select-node-icon-color);
				}
			</style>
					<div>
							${ renderSection(index, dataPlane, node.parentSectionName)
		? html`<div class="section">${ node.parentSectionName }</div>`
		: '' }
						<div class="${ computeRowClass('node-item pointer', node.id === highlightedNode?.id) }">
							<div style="flex: auto" @dblclick="${ onNodeDblClicked }"">${ node.name }</div>
							${ hasChildren(node)
		? html`<span class="icon" @click="${ () => openNode(node) }">
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
		.onSelect=${ item => setHighlightedNode(item) }
		></cosmoz-listbox>
		`;
};

customElements.define('cosmoz-treenode-navigator-next', component(TreenodeNavigatorNext));
