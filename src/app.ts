import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import './views/main-menu';
import './views/level-selection';
import './views/game-screen';
import { OptionSelectedEvent } from "./views/main-menu";
import base from "./styles/base";
import { LevelData, LevelSelectedEvent } from "./views/level-selection";

export enum Screen{
    MainMenu,
    LevelSelection,
    GameScreen
}

@customElement('ms-app')
class App extends LitElement {

    static override styles = [
        base,
        css`
            :host{
                display: grid;
                place-items: stretch;
                grid-template-columns: 1fr;
                grid-template-rows: 1fr;
                min-height: 100vh;
                
            }

            :host > * {
                grid-area: 1 / 1 / 2 / 2;
            }

            canvas{
                width: 100%;
                height: 100vh;
            }
        `
    ]

    @property({ type:Object })
    current_level?: LevelData;

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
        this.play(
            {
                bombs: 9,
                height: 8,
                width: 8,
                name: 'Expert'
            }
        )
    }

    mainMenuOptionSelected(i: number){
        switch(i){
            case 0: 
                this.screen = Screen.LevelSelection
            break;
        }
    }

    play(e: LevelData) {
        this.current_level = e;
        this.screen = Screen.GameScreen
    }


    protected render() {
        return html `
            ${ this.screen == Screen.MainMenu ? html`<ms-main-menu @optionselected=${(e: OptionSelectedEvent) => this.mainMenuOptionSelected(e.detail.option)}></ms-main-menu>` : null }
            ${ this.screen == Screen.LevelSelection ? html`<ms-level-selection @levelselected=${(e: LevelSelectedEvent) => this.play(e.detail)}></ms-level-selection>` : null }
            ${ this.screen == Screen.GameScreen && this.current_level ? html`<ms-game-screen .current_level=${this.current_level}></ms-game-screen>` : null }
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-app': App
    }
}