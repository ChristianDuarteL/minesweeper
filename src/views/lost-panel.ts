import { LitElement, css, html } from "lit";
import { customElement, property, } from "lit/decorators.js";
import base from "../styles/base";
import { classMap } from "lit/directives/class-map.js";
import { dispatch } from "../utils";



@customElement('ms-lost-panel')
export default class LostPanel extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                color: #1265A5;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .panel{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1em;
                opacity: 0;
                pointer-events: none;
                transition: opacity .2s;
            }

            .panel.show{
                backdrop-filter: blur(3px);
                background: #fff8;
                width: 100%;
                height: 100%;
                opacity: 1;
                pointer-events: all;
            }

            h2{
                font-size: 3rem;
                font-weight: 500;
            }
            
            .title{
                color: #1379C7;
                display: inline-flex;
                position: relative;
                align-items: center;
                justify-content: center;
            }

            button{
                font-size: 2em;
                --btn-color: #1379C7;
                color: var(--btn-color);
                position: relative;
                transition: .2s color, .2s outline, .2s outline-color, .2s outline-offset;
                padding: .2em;
                outline-offset: -.1em;
                border-radius: .1em;
                outline: 2px solid transparent;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
            }

            button:hover, button:focus-visible{
                --btn-color: #0B5995;
            }
            
            button:hover, button:focus-visible {
                outline: 2px solid;
                outline-offset: .05em;
                border-radius: .05em;
            }

            button:active{
                --btn-color: #0C5791;
                border-radius: .12em;
                outline-offset: -.05em;
            }
        `
    ];

    @property({
        attribute: "show",
        type: Boolean
    })
    show: boolean = false;

    protected render() {
        return html`
            <div class=${classMap({"panel": true, show: this.show})}>
                <div class="title">
                    <h2>You lost</h2>
                </div>
                <button @click=${() => dispatch(this, 'newgame')}>New game</button>
                <button @click=${() => dispatch(this, 'restartgame')}>Play again</button>
                <button @click=${() => dispatch(this, 'mainmenu')}>Main menu</button>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-lost-panel': LostPanel
    }
}