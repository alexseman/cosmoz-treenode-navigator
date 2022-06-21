import { component, useRef, useState } from 'haunted';
import { html } from 'lit-html';
import { ref } from 'lit-html/directives/ref.js';
import './cosmoz-treenode-navigator-next';

import '@neovici/cosmoz-dialog';


const CosmozTreenodeButtonViewNext = ({ multiSelection }) => {
	const
		[highlightedNodePath, setHighlightedNodePath] = useState(null),
		[nodePath, setNodePath] = useState(''),
		[selectedNode, setSelectedNode] = useState({}),
		[selectedNodes, setSelectedNodes] = useState([]),
		dialogTreeRef = useRef(null),
		nodesOnNodePath = '',
		getButtonTextPlaceholder = () => {
			return multiSelection ? 'Select a node' : 'No selection made';
		},
		getButtonLabel = (pathParts, placeholder) => {
			if (!Array.isArray(pathParts) || pathParts.length === 0) {
				return placeholder;
			}
			return pathParts.filter(n => n)
				.map(part => part[tree.searchProperty])
				.join(' / ');
		},
		openDialogTree = () => {
			dialogTreeRef.current.open();
		},
		selectNode = () => {
			console.log('select')
			// nodePath selects the node, without it no selectedNode
			setNodePath(highlightedNodePath);
			if (multiSelection) {
				if (!selectedNodes.some(node => node.pathLocator === highlightedNodePath)) {
					setSelectedNode(current => [...current, selectedNode]);
				}
				setNodePath('');
				setSelectedNode({});
			}
		};


	return html`
		<style>
			button {
				align-items: center;
				background: white;
				border: none;
				border-radius: 3px;
				box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
				box-sizing: border-box;
				cursor: pointer;
				display: inline-flex;
				flex: auto;
				justify-content: center;
				margin: 0 0.29em;
				min-width: 5.14em;
				outline-width: 0;
				padding: 0.7em 0.57em;
				text-transform: uppercase;
				transition: box-shadow .3s;
			}

			.actions {
				display: flex;
			}

			#dialogTree {
				min-width: 250px !important;
				width: 450px;
			}
		</style>
		<div class="actions">
			<button type="button" @click=${ openDialogTree }>
				${ getButtonLabel(nodesOnNodePath, getButtonTextPlaceholder()) }
			</button>
			<!--TODO: Add button to reset-->
			<!--TODO: Add chips-->
		</div>
		<cosmoz-dialog ${ ref(el => dialogTreeRef.current = el) } class="treeDialog" on-iron-overlay-opened="focusSearch" modal prerender>
			<template>
		  	<h2>Search or navigate to chosen destination</h2>
				<cosmoz-treenode-navigator-next
								id="treeNavigator" class="no-padding" tree="[[ tree ]]" selected-node="{{ selectedNode }}"
										on-data-plane-changed="refit" highlighted-node-path="{{ highlightedNodePath }}"
										search-placeholder="[[ searchPlaceholder ]]" search-global-placeholder="[[ searchGlobalPlaceholder ]]"
										search-min-length="[[ searchMinLength ]]" node-path="{{ nodePath }}" nodes-on-node-path="{{ nodesOnNodePath }}"
										on-node-dblclicked="_selectNodeAndCloseDialog">
					<slot></slot>
				</cosmoz-treenode-navigator-next>
					<div class="buttons">
						<button type="button"
					dialog-confirm
					autofocus
										@click=${ selectNode() }
										?disabled="${ !highlightedNodePath }">Select</button>
						<button type="button" dialog-dismiss>Cancel</button>
					</div>
			</template>
		</cosmoz-dialog>
		`;
};

customElements.define('cosmoz-treenode-button-view-next', component(CosmozTreenodeButtonViewNext));

