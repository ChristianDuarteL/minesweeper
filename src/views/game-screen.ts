import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import base from "../styles/base";

@customElement('ms-game-screen')
export default class GameScreen extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                
                color: #f99;
                gap: 1em;
            }
        `
    ]

    @property({type: Number})
    bombs: number = 0;

    protected render() {
        return html`
            <div class="header">
                
            </div>
            <div class="footer">

            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-game-screen': GameScreen
    }
}