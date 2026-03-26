customElements.define("page-home", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Le nuancier des fleurs suisses.</h1><p>Hello</p>
    `
  }
})
