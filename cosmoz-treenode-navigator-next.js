import { component, useState, useEffect } from 'haunted';
import { html } from 'lit-html';

import '@neovici/cosmoz-input';
import '@neovici/cosmoz-autocomplete';


import { DefaultTree } from '@neovici/cosmoz-tree/cosmoz-default-tree';
import basicTree from './test/data/basicTree';

const TreenodeNavigatorNext = ({ searchPlaceholder }) => {
	const [searchValue, setSearchValue] = useState(''),
		[openNodePath, setOpenNodePath] = useState(''),
		[dataPlane, setDataPlane] = useState(),
		[tree, setTree] = useState(new DefaultTree(basicTree)),
		[selectedNode, setSelectedNode] = useState(),
		[nodePath, setNodePath] = useState(),
		[nodesOnNodePath, setNodesOnNodePath] = useState(),
		[nodesOnOpenNodePath, setNodesOnOpenNodePath] = useState([]),
		[highlightedNode, setHighlightedNode] = useState(),
		[highlightedNodePath, setHighlightedNodePath] = useState(),
		[searchMinLength, setSearchMinLength] = useState(1),
		// [searchPlaceholder, setSearchPlaceholder] = useState('Search'),
		hasChildren = node => {
			return tree.hasChildren(node);
		},
		openNode = clickedNode => {
			console.log(clickedNode);
			console.log(hasChildren(clickedNode));
			if (hasChildren(clickedNode)) {
				setOpenNodePath(clickedNode.path);
				setSearchValue('');
			}
		},
		_computeSearching = (value, searchMinLength) => {
			return value && value.length >= searchMinLength && value !== '';
		},
		_renderSection = (index, dataPlane, parentSectionName) => {
			if (!_computeSearching(searchValue, searchMinLength) || index == null || dataPlane == null || index >= dataPlane.length || parentSectionName == null) {
				return false;
			}
			if (index === 0) {
				return true;
			}
			const prevItem = dataPlane[index - 1];
			return prevItem.parentSectionName !== parentSectionName;
		},
		_normalizeNodes = nodes => {
			if (!Array.isArray(nodes)) {
				return [];
			}
			return nodes.map(node => {
				if (!node) {
					return node;
				}
				const path = node.pathLocator || node.path,
					pathLocatorSeparator = tree.pathLocatorSeparator,
					parentPath = path.includes(pathLocatorSeparator) ? path.substring(0, path.lastIndexOf(pathLocatorSeparator)) : path;
				return {
					name: node[tree.searchProperty],
					path,
					children: node[tree.childProperty],
					parentSectionName: tree.getPathString(parentPath, tree.searchProperty)
				};
			});
		},
		_computeDataPlane = (searching, searchString, renderedLevel, tree) => {
			if (searching && tree) {
				const results = tree.searchNodes(searchString, renderedLevel, false);
				return _normalizeNodes(results);
			}
			return renderedLevel;
		},
		_renderLevel = (pathLocator, tree) => {
			if (!tree) {
				return;
			}
			const node = tree.getNodeByPathLocator(pathLocator),
				children = tree.getChildren(node),
				level = tree.hasChildren(node) ? children : node,
				sortFunc = (a, b) => {
					// First sort based on "folder" status (containing children)
					if (hasChildren(a)) {
						if (!hasChildren(b)) {
							return -1;
						}
					} else if (hasChildren(b)) {
						return 1;
					}
					// Then sort on searchProperty
					const val1 = a[tree.searchProperty],
						val2 = b[tree.searchProperty];

					if (val1 > val2) {
						return 1;
					}
					if (val1 < val2) {
						return -1;
					}
					return 0;
				};

			return _normalizeNodes(level)
				.sort(sortFunc);
		};

	useEffect(() => {
		if (!openNodePath) {
			setHighlightedNodePath('');
			setNodesOnOpenNodePath([]);
			return;
		}
		setHighlightedNodePath(openNodePath);
		setNodesOnOpenNodePath(_normalizeNodes(tree.getPathNodes(openNodePath).filter(item => item)));
	}, [openNodePath]);

	useEffect(() => {
		_computeDataPlane(_computeSearching(searchValue, searchMinLength), searchValue, _renderLevel(openNodePath, tree), tree);
	}, [searchValue]);


	return html`
		<style>

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
					<span class="icon" @click=${ openNode }>
							<svg viewBox="0 0 24 24"
				   preserveAspectRatio="xMidYMid meet"
				   focusable="false"
				   style="pointer-events: none; display: block; width: 100%; height: 100%;">
									<g>
											<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
									</g>
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
				.items="${ _computeDataPlane(_computeSearching(searchValue, searchMinLength), searchValue, _renderLevel(openNodePath, tree), tree) }"
				.textual=${ item => item.name }
				.onSelect=${ item => openNode(item) }
		></cosmoz-listbox>
		`;
};
customElements.define('cosmoz-treenode-navigator-next', component(TreenodeNavigatorNext));
