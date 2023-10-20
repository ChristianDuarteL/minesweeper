import { Engine, dimension, point } from "../engine/Engine";
import { Grid } from "../engine/Grid";
import { addPositions, substractPositions } from "../utils";
import { GameContext } from "../views/game-screen";

const FONT_COLORS = [ '#ffff', '#3ea1ed', '#9adf51', '#ef6c8b', '#0247ae', '#5098ff', '#578a63', '#9b5b9b', '#ff9a3b', '#ff3b3b',]

export class GameGrid extends Grid {
    max_row_labels_count?: number;
    max_col_labels_count?: number;
    padding: number = 6;
    
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

    click_fn = (index: point, game: Engine<GameContext>) => {
        if(!game.context.game){
            game.dispatchEvent(new CustomEvent<point>('generategame', {
                detail: index,
            }))
            return;
        }
    }

    touch_fn = () => {
    }

    draw_element_fn = (ctx: CanvasRenderingContext2D, i: point, pos: point, size: dimension, game: Engine<GameContext>) => {
        if(game.context.selected_tile && game.context.selected_tile[0] == i[0] && game.context.selected_tile[1] === i[1]){
            ctx.fillStyle = "#8fcdff";
        }else{
            ctx.fillStyle = "#60bdfc";
        }
        if(game.context.game?.get_tile(...i)){
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#ddd";
        }
        ctx.beginPath();
        ctx.roundRect(...addPositions(...pos, this.padding / 2), ...substractPositions(...size, this.padding), 10);
        ctx.fill();
        ctx.stroke();
        if(!game.context.game?.get_tile(...i)){
            return;
        }
        const n = game.context.shadow_game?.surrounding_bombs(...i)
        if(n && n > 0){
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillStyle = FONT_COLORS[n];
            ctx.font = "bold 38px 'Nunito'";
            const metrics = ctx.measureText(n?.toString());
            ctx.fillText(n?.toString(), pos[0] + size[0] /2 , pos[1] + size[1] / 2 - metrics.actualBoundingBoxDescent + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2)
        }
    };

}

declare global{
    interface DefaultEngineEventMap {
        generategame: point,
        sweep: point
    }
}