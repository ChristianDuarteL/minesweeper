import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { dispatch } from "../utils";
import base from "../styles/base";
import { map } from "lit/directives/map.js";


export interface LevelData{
    name: string;
    width: number;
    height: number;
    bombs: number;
}

export type LevelSelectedEvent = CustomEvent<LevelData>;

@customElement('ms-level-selection')
export default class LevelSelectionMenu extends LitElement {
    static override styles = [
        base,
        css`
            :host{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                
                color: #1265A5;
                gap: 1em;
            }

            h2{
                font-size: 3rem;
                font-weight: 500;
            }
            
            .title{
                color: #1379C7;
                display: inline-flex;
                position: relative;
                align-items: center;
                justify-content: center;
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
                --btn-color: #1379C7;
                color: var(--btn-color);
                position: relative;
                transition: .2s color, .2s outline, .2s outline-color, .2s outline-offset;
                min-width: 150px;
                min-height: 150px;
                width: 18vmin;
                height: 18vmin;
                padding: .2em;
                outline-offset: -.1em;
                border-radius: .1em;
                outline: 2px solid transparent;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
            }

            button:hover, button:focus-visible{
                --btn-color: #0B5995;
            }
            
            button:hover, button:focus-visible {
                outline: 2px solid;
                outline-offset: .05em;
                border-radius: .05em;
            }

            button:active{
                --btn-color: #0C5791;
                border-radius: .12em;
                outline-offset: -.05em;
            }
            
            .difficulties-container{
                display: flex;
                justify-content: center;
                gap: 1em;
                flex-wrap: wrap;
            }

            .level-name{
                font-size: 2rem;
            }

            .level-size{
                font-size: 1rem;
                margin-left: .25rem;
            }
        `
    ]

    @property({ type: Array })
    levels: LevelData[] = [
        {
            bombs: 9,
            height: 8,
            width: 8,
            name: 'Classic'
        },
        {
            bombs: 10,
            height: 9,
            width: 9,
            name: 'Easy'
        },
        {
            bombs: 40,
            height: 16,
            width: 16,
            name: 'Medium'
        },
        {
            bombs: 99,
            height: 16,
            width: 30,
            name: 'Expert'
        }
    ];

    selectLevel(level_data: LevelData){
        dispatch(this, 'levelselected', level_data);
    }

    protected render() {
        return html`
            <div class="title">
                <h2>Select difficulty</h2>
            </div>
            <div class="difficulties-container">
                ${ map(this.levels, (e) => html`
                    <button @click=${() => this.selectLevel(e)}>
                        <span class="level-name">${e.name}</span>
                        <span class="level-size">${e.width} x ${e.height}</span>
                    </button>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'ms-level-selection': LevelSelectionMenu
    }
    interface GlobalEventHandlersEventMap{
        'levelselected': LevelSelectedEvent
    }
}