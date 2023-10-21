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
import { addPositions } from "../utils";

export interface GameContext {
    selected_tile?: point;
    level_data: LevelData;
    game?: Game,
    shadow_game?: Game
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

    engine?: Engine<GameContext, DefaultEngineEventMap>;

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
            });
            this._sweepCallback = ({detail: pos}: CustomEvent<point>) => this.sweep(pos);
            this._generateGameCallback = this.generateGame.bind(this)
            this._markCallback = ({detail: pos}: CustomEvent<point>) => this.mark(pos);
            this.engine.addEventListener('generategame', this._generateGameCallback)
            this.engine.addEventListener('sweep', this._sweepCallback)
            this.engine.addEventListener('mark', this._markCallback)
            this.engine.addEntity(new GameGrid());
            this.recalculateCanvas();
            this.engine.startLoop();
        }
    }

    dispose_engine(){
        if(!this.engine) return;
        this._generateGameCallback && this.engine.removeEventListener('generategame', this._generateGameCallback);
        this._sweepCallback && this.engine.removeEventListener('sweep', this._sweepCallback)
        this._markCallback && this.engine.removeEventListener('mark', this._markCallback)
    }

    _generateGameCallback?: (evt: CustomEvent<point>) => void;
    _sweepCallback?: (evt: CustomEvent<point>) => void;
    _markCallback?: (evt: CustomEvent<point>) => void;

    generateGame({detail: pos}: CustomEvent<point>) {
        if(!this.engine || this.engine.context.game) return;
        if(!this.current_level) return;
        this.engine.setContext({
            game: new Game(this.current_level, false),
            shadow_game: new Game(this.current_level)
        })
        this.sweep(pos);
    }

    isTileAvailable(game: Game, x: number, y: number){
        return x >= 0 && x < game.level_data.width &&
        y >= 0 && y < game.level_data.height 
        && !game.get_tile(x, y)
        && (
            game.get_tile(x + 1, y) == 0 ||
            game.get_tile(x - 1, y) == 0 ||
            game.get_tile(x + 1, y + 1) == 0 ||
            game.get_tile(x + 1, y - 1) == 0 ||
            game.get_tile(x - 1, y + 1) == 0 ||
            game.get_tile(x - 1, y - 1) == 0 ||
            game.get_tile(x, y + 1) == 0 ||
            game.get_tile(x, y - 1) == 0
        );
    }

    mark(pos: point) {
        if(!this.engine) return;
        this.engine.context.game?.set_tile(...pos, -1);
    }

    async sweep(pos: point){
        if(!this.engine || !this.engine.context.game || !this.engine.context.shadow_game) return;
        if(!this.current_level) return;
        let stack_next: point[] = [];
        this.engine.dispatchEvent(new CustomEvent('swept', { detail: pos }));
        if(!this.engine.context.shadow_game.get_tile(...pos)){
            stack_next.push(pos)
        }
        while(stack_next.length > 0){
            const stack = stack_next;
            stack_next = [];
            let elem: point | undefined;
            while((elem = stack.pop())){
                const tile = this.engine.context.shadow_game.get_tile(...elem);
                this.engine.dispatchEvent(new CustomEvent('swept', { detail: elem }));
                this.engine.setContext(() => {
                    elem && this.engine?.context.game?.set_tile(...elem, 1);
                });
                if(tile || this.engine.context.shadow_game.surrounding_bombs(...elem)){
                    continue;
                }
                let m;
                this.engine.context.game.get_tile(...(m = addPositions(...elem, 0, 1)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, 0, -1)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, 1, 0)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, -1, 0)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, 1, 1)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, 1, -1)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, -1, 1)), null) === 0 && stack_next.push(m);
                this.engine.context.game.get_tile(...(m = addPositions(...elem, -1, -1)), null) === 0 && stack_next.push(m);
            }
            await this.engine.waitTimeout(32);
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