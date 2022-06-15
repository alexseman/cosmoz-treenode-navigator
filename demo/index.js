import { component } from 'haunted';
import { html } from 'lit-html';
import '../cosmoz-treenode-button-view-next.js';

const App = () => {
	return html`
		<cosmoz-treenode-button-view-next .multiSelection=${ false }>
		</cosmoz-treenode-button-view-next>
<!--		<cosmoz-treenode-button-view-next .multiSelection=${ true }>-->
<!--		</cosmoz-treenode-button-view-next>-->
		`;
};

customElements.define('cosmoz-treenode-nav', component(App));
