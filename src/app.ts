import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Engine } from "./engine/Engine";

export enum Screen{
    MainMenu,
    GameScreen
}

@customElement('ms-app')
class App extends LitElement {

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

    @property({ type: Number, })
    screen = Screen.MainMenu;

    connectedCallback(): void {
        super.connectedCallback()
        this.canvas = this.renderRoot.querySelector('canvas');
    }

    protected render() {
        return html `
            ${
                this.screen == Screen.GameScreen ? 
                html`` :
                html`<ms-main-menu></ms-main-menu>`
            }
            <canvas></canvas>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-app': App
    }
}