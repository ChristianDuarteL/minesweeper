import { AbstractGame } from "../core/game";
import { Engine, dimension, point } from "../engine/Engine";
import { Grid } from "../engine/Grid";
import { lerpi } from "../engine/math";
import { Color } from "../engine/painting";
import { addPositions, substractPositions } from "../utils";
import { CellData, GameContext } from "../views/game-screen";

const FONT_COLORS = [ '#ffff', '#3ea1ed', '#9adf51', '#ef6c8b', '#0247ae', '#5098ff', '#578a63', '#9b5b9b', '#ff9a3b', '#ff3b3b',]
const TILE_COLORS = {
    normal: new Color('60bdfc'),
    selected: new Color('8fcdff'),
    marked: new Color('fcbc60'),
    unknown: new Color('73fc60'),
}

const TEXT_TILE_COLORS = {
    normal: new Color('FFFFFF'),
}

export class GameGrid extends Grid {
    max_row_labels_count?: number;
    max_col_labels_count?: number;
    padding: number = 6;
    
    constructor(size_ratio: point = [1, 1]){
        super([1, 1], size_ratio)
    }

    init(game: Engine<GameContext>): void {
        this.setSize([game.context.level_data.width, game.context.level_data.height]);
        game.setContext({ 
            grid_data: new AbstractGame<CellData>({
                width: game.context.level_data.width,
                height: game.context.level_data.height,
            }, () => ({
                animating: false,
                animation_time: 0,
                animation_duration: 200
            }))
        })
    }

    selected_change_fn = (indices: point, game: Engine<GameContext>) => {
        game.setContext({
            selected_tile: indices
        });
    }

    click_fn = (index: point, game: Engine<GameContext>, evt: MouseEvent) => {
        if(!game.context.game){
            game.dispatchEvent(new CustomEvent<point>('generategame', {
                detail: index,
            }))
            return;
        }
        game.dispatchEvent(new CustomEvent<point>(evt.buttons & 2 ? 'mark' : 'sweep', {
            detail: index,
        }))
    }

    touch_fn = () => {
    }

    draw_element_fn = (ctx: CanvasRenderingContext2D, i: point, pos: point, size: dimension, game: Engine<GameContext>) => {
        const tile = game.context.grid_data?.get_tile(...i, null);
        if(!tile) return;
        ctx.fillStyle = "#60bdfc";
        ctx.strokeStyle = "#ddd";
        if(game.context.selected_tile && game.context.selected_tile[0] == i[0] && game.context.selected_tile[1] === i[1]){
            ctx.fillStyle = "#8fcdff";
            ctx.strokeStyle = "#ddd";
        }
        ctx.beginPath();
        ctx.roundRect(...addPositions(...pos, this.padding / 2), ...substractPositions(...size, this.padding), 10);
        ctx.fill();
        switch(game.context.game?.get_tile(...i)){
            case 1:
                ctx.fillStyle = "#fff";
                ctx.strokeStyle = "#ddd";
                break;
            case -1:
                ctx.fillStyle = "#fcbc60";
                ctx.strokeStyle = "#ddd";
                if(tile.animating){
                    ctx.fillStyle = TILE_COLORS.normal.lerp(TILE_COLORS.marked, tile.animation_time / tile.animation_duration).toHexString();
                }
                break;
            case -2:
                ctx.fillStyle = "#73fc60";
                ctx.strokeStyle = "#ddd";
                if(tile.animating){
                    ctx.fillStyle = TILE_COLORS.marked.lerp(TILE_COLORS.unknown, tile.animation_time / tile.animation_duration).toHexString();
                }
                break;
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(...addPositions(...pos, this.padding / 2), ...substractPositions(...size, this.padding), 10);
        ctx.fill();
        ctx.stroke();
        
        switch(game.context.game?.get_tile(...i)){
            case -1: {
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.strokeStyle = '#1379C7';
                ctx.lineWidth = 2;
                ctx.fillStyle = '#69beff';
                ctx.font = "bold 38px 'Nunito'";
                ctx.beginPath();
                const pos_start = addPositions(...pos, (size[0] - (size[0] / 2.5)) / 2, size[1] / 4);
                const pos_animating = tile.animating ? lerpi(0, size[0] / 2.5, (tile.animation_time - tile.animation_duration / 2) / (tile.animation_duration / 2)) : size[0] / 2.5;
                ctx.moveTo(...pos_start);
                ctx.lineTo(pos_start[0] + pos_animating, pos_start[1] + size[0] / 2.5 / 1.4375 / 2);
                ctx.lineTo(pos_start[0],  pos_start[1] + size[0] / 2.5 / 1.4375);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#888';
                ctx.fillRect(
                    pos_start[0],  
                    tile.animating ? lerpi(pos_start[1] + size[1] / 2, pos_start[1], tile.animation_time / (tile.animation_duration / 2)) : pos_start[1], 
                    3, 
                    tile.animating ? lerpi(0, size[1] / 2, tile.animation_time / (tile.animation_duration / 2)) : size[1] / 2, 
                );
            }break;
            case -2: {
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = (tile.animating ? TILE_COLORS.unknown.lerp(TEXT_TILE_COLORS.normal, tile.animation_time / tile.animation_duration) : TEXT_TILE_COLORS.normal).toHexString();
                ctx.font = "bold 38px 'Nunito'";
                const metrics = ctx.measureText('?');
                const pos_y = tile.animating ? lerpi(size[1] * 3 / 4, size[1] / 2, tile.animation_time / tile.animation_duration) : size[1] / 2;
                ctx.fillText('?', pos[0] + size[0] / 2, pos[1] + pos_y - metrics.actualBoundingBoxDescent + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2)
            }break;
        }

        if(game.context.game?.get_tile(...i) !== 1){
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
        sweep: point,
        mark: point,
    }
}