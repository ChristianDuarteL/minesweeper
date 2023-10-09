import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { dispatch } from "../utils";

export type OptionSelectedEvent = CustomEvent<{
    option: number
}>;

@customElement('ms-main-menu')
export default class MainMenu extends LitElement {
    static override styles = [
        css`
            :host{
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1em;
            }

        `
    ]

    selectOption(option: number){
        dispatch(this, 'optionselected', { option });
    }

    protected render() {
        return html`
            <h1>Minesweeper</h1>
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