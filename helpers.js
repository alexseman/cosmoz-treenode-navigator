import { DefaultTree } from '@neovici/cosmoz-tree/cosmoz-default-tree';
import basicTree from './test/data/basicTree';

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
				parentSectionName: tree.getPathString(parentPath, tree.searchProperty)
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
		console.log(selected)
		return selected ? classes + ' selected' : classes;
	};

export {
	hasChildren, computeSearching,
	normalizeNodes, renderLevel, computeDataPlane, computeRowClass
};
