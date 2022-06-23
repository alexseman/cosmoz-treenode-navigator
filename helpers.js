import { DefaultTree } from '@neovici/cosmoz-tree/cosmoz-default-tree';
import basicTree from './test/data/basicTree';
import { tagged as css } from '@neovici/cosmoz-utils/lib/tagged';

const tree = new DefaultTree(basicTree),
	hasChildren = node => {
		return tree.hasChildren(node);
	},
	computeSearching = (value, searchMinLength) => {
		return value && value.length >= searchMinLength && value !== '';
	},
	normalizeNodes = nodes => {
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
				parentSectionName: tree.getPathString(parentPath, tree.searchProperty),
				id: node.id,
				pathLocator: node.pathLocator
			};
		});
	},
	computeDataPlane = (searching, searchString, renderedLevel, tree) => {
		if (searching && tree) {
			const results = tree.searchNodes(searchString, renderedLevel, false);
			return normalizeNodes(results);
		}
		return renderedLevel;
	},
	renderLevel = (pathLocator, tree) => {
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

		return normalizeNodes(level)
			.sort(sortFunc);
	},
	computeRowClass = (classes, selected) => {
		return selected ? classes + ' selected' : classes;
	},
	onNodeDblClicked = event => {
		dispatchEvent(new CustomEvent('node-dblclicked', {
			composed: true,
			bubbles: false,
			detail: {
				model: event.model
			}
		}));
	},
	getNodeName = node => {
		return node[tree.searchProperty];
	},
	showGlobalSearchBtn = (searching, openNodeLevelPath) => {
		return searching && openNodeLevelPath !== '';
	},
	nodeStyles = css`
	  .section {
			background-color: #f5f5f5;
			padding: 5px;
	  }

		.pointer {
			cursor: pointer;
		}

	  .item {
			padding: 0;
	  }

	  .item[data-index] {
			background: transparent;
	  }

	  .node-item {
			align-items: center;
			display: flex;
			font-family: 'Roboto', 'Noto', sans-serif;
			font-size: 16px;
			font-weight: 400;
			height: 28px;
			line-height: 24px;
			padding: 6px 12px;
	  }

	  .node-item-wrapper {
			width: 100%;
	  }

	  .icon {
			box-sizing: border-box;
			cursor: pointer;
			display: inline-block;
			height: 40px;
			line-height: 1;
			outline: none;
			padding: 8px;
			position: relative;
			user-select: none;
			width: 40px;
			z-index: 0;
	  }

	  .node-item.selected {
			background-color: var(--cosmoz-listbox-active-color, var(--cosmoz-selection-color, rgba(58, 145, 226, 0.1)));
			transition: background-color 0.2s ease-out;
	  }

	  .node-item.selected .icon svg {
			fill: var(--cosmoz-treenode-navigator-select-node-icon-color);
			transition: color 0.8s ease-out;
	  }`;

export {
	hasChildren,
	computeSearching,
	normalizeNodes,
	renderLevel,
	computeDataPlane,
	computeRowClass,
	onNodeDblClicked,
	getNodeName,
	showGlobalSearchBtn,
	nodeStyles
};
