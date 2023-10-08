import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Engine } from "../engine/Engine";

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

    connectedCallback(): void {
        super.connectedCallback()
        this.canvas = this.renderRoot.querySelector('canvas');
    }

    protected render() {
        return html `
            <canvas></canvas>
        `
    }
}