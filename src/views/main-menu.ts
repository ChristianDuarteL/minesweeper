import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { dispatch } from "../utils";
import base from "../styles/base";

export type OptionSelectedEvent = CustomEvent<{
    option: number
}>;

@customElement('ms-main-menu')
export default class MainMenu extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                display: flex;
                flex-direction: column;
                align-items: center;
                
                color: #f99;
                gap: 1em;
            }

            h1{
                font-size: 4rem;
            }
            
            .title{
                color: #f99;
                display: inline-flex;
                position: relative;
                align-items: center;
                justify-content: center;
            }

            .line{
                display: flex;
                justify-content: space-between;
                position: absolute;
                height: 6px;
                width: calc(100% + 9em);
                padding: 0 2em;
                padding: block;
                animation:  3s title-line-anim infinite linear;
                box-sizing: border-box;
            }
            
            @keyframes title-line-anim {
                0%{
                    padding: 0 0;
                }
                50%{
                    padding: 0 2em;
                }
                100%{
                    padding: 0 0;
                }
            }

            .line:nth-child(2) {
                transform: rotateZ(6deg);
            }

            .line:nth-child(4) {
                transform: rotateZ(-6deg);
            }

            .line::after, .line::before{
                content: '';
                display: block;
                width: 2em;
                height: 100%;
                background: currentColor;
            }

            button{
                font-size: 2em;
                --btn-color: #f99;
                color: var(--btn-color);
                position: relative;
                transition: .2s;
                padding: .2em .7em;
                outline: 2px solid transparent;
            }

            button::after, button::before{
                content: '';
                position: absolute;
                width: .25em;
                height: .25em;
                background: currentColor;
                border-radius: .05em;
                opacity: 0;
                transition: .2s;
                --corner-padding: 20%;
            }

            button::after {
                top: var(--corner-padding);
                right: var(--corner-padding);
            }
            
            button::before {
                bottom: var(--corner-padding);
                left: var(--corner-padding);
            }

            button:hover, button:focus-visible{
                --btn-color: #f88;
            }
            
            button:focus-visible {
                outline: 2px solid;
                border-radius: .05em;
                outline-offset: .05em;
            }

            button:active{
                --btn-color: #f77;
                outline-offset: -.05em;
            }

            button:hover::before, button:hover::after, 
            button:focus-visible::before, button:focus-visible::after {
                --corner-padding: 0%;
                opacity: 1;
            }

            button:active::after, button:active::before {
                --corner-padding: 10%;
            }
        `
    ]

    selectOption(option: number){
        dispatch(this, 'optionselected', { option });
    }

    protected render() {
        return html`
            <div class="title">
                <h1>Minesweeper</h1>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>

            <button @click=${() => this.selectOption(0)}>Play</button>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-main-menu': MainMenu
    }
    interface GlobalEventHandlersEventMap{
        'optionselected': OptionSelectedEvent
    }
}