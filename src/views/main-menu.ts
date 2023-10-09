import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('ms-main-menu')
export default class MainMenu extends LitElement {
    protected render() {
        return html`Hola`
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-main-menu': MainMenu
    }
}