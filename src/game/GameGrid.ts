import { Engine, dimension, point } from "../engine/Engine";
import { Grid } from "../engine/Grid";
import { GameContext } from "../views/game-screen";

export class GameGrid extends Grid {
    max_row_labels_count?: number;
    max_col_labels_count?: number;
    
    constructor(size_ratio: point = [1, 1]){
        super([1, 1], size_ratio)
    }

    init(game: Engine<GameContext>): void {
        this.setSize([game.context.level_data.width, game.context.level_data.height]);
    }

    selected_change_fn = (indices: point, game: Engine<GameContext>) => {
        game.setContext({
            selected_tile: indices
        });
    }

    click_fn = () => {
    }

    touch_fn = () => {
    }

    draw_element_fn = (ctx: CanvasRenderingContext2D, i: point, pos: point, size: dimension, game: Engine<GameContext>) => {
        if(game.context.selected_tile && game.context.selected_tile[0] == i[0] && game.context.selected_tile[1] === i[1]){
            ctx.fillStyle = (i[0] + i[1]) % 2 ? "#bfe17d" : "#b9dd77";
        }else{
            ctx.fillStyle = (i[0] + i[1]) % 2 ? "#aad751" : "#a2d149";
        }
        ctx.fillRect(...pos, ...size);
    };

}