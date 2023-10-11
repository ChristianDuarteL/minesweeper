import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import base from "../styles/base";
import { FlagIcon } from "../icons/flag-icon";
import '../components/game-indicator'
import { ClockIcon } from "../icons/clock";

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
                
                color: #1265A5;
                gap: 1em;

                --flag: #f66;
                
                --flag:  #1379C7;
                --handle: #888;
                padding: 1em 0;
            }

            ms-game-indicator{
                color: #1379C7;
            }

            .header, .footer{
                max-width: 640px;
                width: 90%;
                display: flex;
            }
            .header{
                justify-content: space-between;
            }
        `
    ]

    @property({type: Number})
    bombs: number = 0;

    protected render() {
        return html`
            <div class="header">
                <ms-game-indicator>
                    ${FlagIcon}
                </ms-game-indicator>
                
                <ms-game-indicator>
                    ${ClockIcon}
                </ms-game-indicator>
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