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
            ctx.fillStyle = "#8fcdff";
        }else{
            ctx.fillStyle = "#60bdfc";
        }
        ctx.beginPath();
        ctx.roundRect(pos[0] + 3, pos[1] + 3, size[0] - 6, size[1] - 6, 10);
        ctx.fill();
    };

}