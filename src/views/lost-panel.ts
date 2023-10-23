import { LitElement, css, html } from "lit";
import { customElement, } from "lit/decorators.js";
import base from "../styles/base";



@customElement('ms-lost-panel')
export default class LostPanel extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                
                color: #1265A5;
                gap: 1em;
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
    ]

    protected render() {
        return html`
            <div class="title">
                <h2>You lost</h2>
            </div>
            <button>Play again</button>
            <button>New game</button>
            <button>Main menu</button>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-lost-panel': LostPanel
    }
}