import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import base from "../styles/base";

@customElement('ms-game-indicator')
export default class GameIndicator extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                font-size: 2.5em;
                display: flex;
                gap: 1rem;
                align-items: center;
            }
        `
    ]

    @property({type: Number})
    amount: number = 0;

    protected render() {
        return html`
            <slot></slot>
            <span class="indicator">${this.amount}</span>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-game-indicator': GameIndicator
    }
}