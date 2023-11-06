import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import base from "../styles/base";
import { FlagIcon } from "../icons/flag-icon";
import '../components/game-indicator'
import { ClockIcon } from "../icons/clock";
import { LevelData } from "./level-selection";
import { Engine, point } from "../engine/Engine";
import { GameGrid } from "../game/GameGrid";
import { AbstractGame, Game } from "../core/game";
import { addPositions } from "../utils";

import './lost-panel';

export interface CellData{
    animating: boolean,
    animation_time: number,
    animation_duration: number,
}

export interface GameContext {
    selected_tile?: point;
    level_data: LevelData;
    game?: Game,
    shadow_game?: Game;
    grid_data?: AbstractGame<CellData>;
    flags?: number;
}

export enum GameStatus {
    Playing,
    Won,
    Lost
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

            .header, .footer {
                position: absolute;
            }
            
            .header{
                justify-content: space-between;
            }
            canvas{
                height: 0;
                flex: 1; 
            }
            
            ms-lost-panel{
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            
            ms-lost-panel[show]{
                pointer-events: all;
            }
        `
    ]

    engine?: Engine<GameContext, DefaultEngineEventMap>;

    @property({type: Number})
    bombs_left: number = 0;

    @property({type: Number})
    time_elapsed: number = 0;
    
    @property({type: Number})
    game_status: GameStatus = GameStatus.Playing;

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

    reinitialize(){
        if(!this.engine) return;
        this.engine.setContext({
            game: undefined,
            shadow_game: undefined,
            flags: undefined,
        });
        this.game_status = GameStatus.Playing;
        this.recalculateBombsLeft();
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
            this.recalculateBombsLeft()
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
            shadow_game: new Game(this.current_level, false),
            flags: 0,
        });
        this.engine.context?.shadow_game?.generate_bombs([
            addPositions(...pos, -1, -1),
            addPositions(...pos, -1,  0),
            addPositions(...pos, -1,  1),
            addPositions(...pos,  0, -1),
            addPositions(...pos,  0,  0),
            addPositions(...pos,  0,  1),
            addPositions(...pos,  1, -1),
            addPositions(...pos,  1,  0),
            addPositions(...pos,  1,  1),
        ])
        this.sweep(pos);
        this.recalculateBombsLeft()
    }

    isTileAvailable(game: Game, x: number, y: number){
        return x >= 0 && x < game.game_data.width &&
        y >= 0 && y < game.game_data.height 
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
        const tile = this.engine.context.game?.get_tile(...pos, null);
        if(tile === null || tile === undefined || tile == 1) return;
        const new_tile = (tile - 1) % 3;
        this.engine.setContext((ctx) => {
            ctx.game?.set_tile(...pos, new_tile)
            if(!ctx.grid_data) return;
            const grid_tile = ctx.grid_data.get_tile(...pos, null);
            if(grid_tile) {
                grid_tile.animating = true;
                grid_tile.animation_duration = 100;
                grid_tile.animation_time = 0;
                this.engine?.setTicker(grid_tile.animation_duration, () => {
                    this.engine?.setContext(() => {
                        grid_tile.animation_time += this.engine?.deltaTime ?? 0
                    });
                }, () => {
                    this.engine?.setContext(() => {
                        grid_tile.animating = false;
                        grid_tile.animation_time = 0;
                    });
                })
            }
        });
        
        this.engine.setContext({
            flags: (this.engine.context.flags ?? 0) + (tile == -1 && new_tile != -1 ? -1 : tile != -1 && new_tile == -1 ? 1 : 0),
        })
        this.recalculateBombsLeft()
    }

    recalculateBombsLeft(){
        this.engine && this.current_level && (this.bombs_left = this.current_level.bombs - (this.engine.context.flags ?? 0));
    }

    async sweep(pos: point){
        if(!this.engine || !this.engine.context.game || !this.engine.context.shadow_game) return;
        if(!this.current_level) return;
        const tile = this.engine.context.game.get_tile(...pos, null);
        if(tile === null || tile === undefined || tile != 0) return;
        let stack_next: point[] = [];
        this.engine.dispatchEvent(new CustomEvent('swept', { detail: pos }));
        if(this.engine.context.shadow_game.get_tile(...pos)){
            this.engine.dispatchEvent(new CustomEvent('sweptmine', {
                detail: pos
            }));
            this.game_status = GameStatus.Lost;
            return;
        }
        stack_next.push(pos)
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
            <ms-lost-panel 
                ?show=${this.game_status == GameStatus.Lost} 
                @newgame=${this.reinitialize}
            ></ms-lost-panel>
            <div class="footer">

            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-game-screen': GameScreen
    }
    interface DefaultEngineEventMap {
        sweptmine: point,
    }
}