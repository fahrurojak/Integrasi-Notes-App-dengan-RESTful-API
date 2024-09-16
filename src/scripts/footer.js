export default class FooterComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(
        document.getElementById('footer-template').content.cloneNode(true)
      );
    }
}

customElements.define('footer-component', FooterComponent);
