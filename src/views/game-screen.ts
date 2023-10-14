import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import base from "../styles/base";
import { FlagIcon } from "../icons/flag-icon";
import '../components/game-indicator'
import { ClockIcon } from "../icons/clock";
import { LevelData } from "./level-selection";
import { Engine, point } from "../engine/Engine";
import { GameGrid } from "../game/GameGrid";
import { Game } from "../core/game";

export interface GameContext {
    selected_tile?: point;
    level_data: LevelData;
    game: Game,
    shadow_game: Game
}

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

            .header, canvas, .footer{
                max-width: 640px;
                width: 90%;
                display: flex;
            }
            
            .header{
                justify-content: space-between;
            }
            canvas{
                height: 0;
                flex: 1; 
            }
        `
    ]

    engine?: Engine<GameContext>;

    @property({type: Number})
    bombs_left: number = 0;

    @property({type: Number})
    time_elapsed: number = 0;

    _current_level?: LevelData;
    
    @property({type: Object})
    set current_level(level_data: LevelData) {
        this._current_level = level_data;
        this.requestUpdate();
        this.init_engine();
    }
    
    public get current_level() : LevelData | undefined {
        return this._current_level;
    }    

    get canvas(){
        return this.renderRoot?.querySelector('canvas');
    }

    protected firstUpdated(changedProperties: PropertyValueMap<unknown> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(changedProperties)
        this.init_engine();
        this.engine?.startLoop();
    }

    init_engine(){
        const canvas = this.canvas;
        if(this._current_level && canvas){
            this.engine = new Engine(canvas, {
                level_data: this._current_level,
                game: new Game(this._current_level),
                shadow_game: new Game(this._current_level, false),
            });
            this.engine.addEntity(new GameGrid());
            this.recalculateCanvas();
        }
    }


    recalculateCanvas(){
        if(!this.canvas) return;
        this.engine?.setSize(this.canvas.offsetWidth*window.devicePixelRatio, this.canvas.offsetHeight*window.devicePixelRatio) 
    }

    protected render() {
        return html`
            <div class="header">
                <ms-game-indicator amount=${this.bombs_left}>
                    ${FlagIcon}
                </ms-game-indicator>
                <ms-game-indicator amount=${this.time_elapsed}>
                    ${ClockIcon}
                </ms-game-indicator>
            </div>
            <canvas></canvas>
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