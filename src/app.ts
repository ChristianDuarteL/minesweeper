import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Engine } from "./engine/Engine";
import './views/main-menu';
import { OptionSelectedEvent } from "./views/main-menu";

export enum Screen{
    MainMenu,
    PlayMenu,
    GameScreen
}

@customElement('ms-app')
class App extends LitElement {

    static override styles = [
        css`
            :host{
                display: grid;
                place-items: center;
                grid-template-columns: 1fr;
                grid-template-rows: 1fr;
                min-height: 100vh;
                
            }

            :host > * {
                grid-area: 1 / 1 / 2 / 2;
            }
        `
    ]

    _canvas: HTMLCanvasElement | null = null;
    engine: Engine | null = null;

    get canvas(){
        return this._canvas;
    }

    set canvas(value: HTMLCanvasElement | null){
        this._canvas = value;
        this.engine?.dispose();
        this._canvas = this.canvas;
        this.canvas && (this.engine = new Engine(this.canvas, {}));
    }

    _screen = Screen.MainMenu;
    
    @property({ type: Number, })
    set screen(value: Screen){
        this._screen = value;
        this.requestUpdate();
    }

    get screen(){
        return this._screen;
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.canvas = this.renderRoot.querySelector('canvas');
    }

    mainMenuOptionSelected(i: number){
        switch(i){
            case 0: 
                this.screen = Screen.GameScreen
            break;
        }
    }

    protected render() {
        return html `
            <canvas></canvas>
            ${
                this.screen == Screen.MainMenu ? 
                html`<ms-main-menu @optionselected=${(e: OptionSelectedEvent) => this.mainMenuOptionSelected(e.detail.option)}></ms-main-menu>` :
                html``
            }
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-app': App
    }
}