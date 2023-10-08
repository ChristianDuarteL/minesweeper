import { Engine, Entity, dimension, point } from "./Engine";
import { mapArrays } from "./utils";

export interface GridContext {
    selected_tile?: point
}

export class Grid extends Entity {
    grid_size: point = [1, 1];
    private size_ratio: point = [1, 1];
    private aspect_ratio: number = 1;
    private rect_size?: dimension;
    private board_size?: dimension;
    private rect_pos?: point;
    private board_pos?: point;


    draw_element_fn?: (ctx: CanvasRenderingContext2D, indices: point, pos: point, size: dimension, game: Engine) => void = () => {};
    selected_change_fn: (indices: point, game: Engine, event: MouseEvent, last_index: point | null) => void = () => { };
    click_fn: (index: point, game: Engine, event: MouseEvent) => void  = () => { };
    touch_fn: (index: point, game: Engine, touch: Touch, event: TouchEvent) => void = () => {};

    constructor(grid_size: point, size_ratio: point){
        super();
        this.setSize(grid_size);
        this.setSizeRatio(size_ratio);
    }

    setSize(grid_size: point) {
        this.grid_size = grid_size;
        this.aspect_ratio = grid_size[0] / grid_size[1];
    }

    setSizeRatio(size_ratio: point) {
        this.size_ratio = size_ratio;
    }

    draw(ctx: CanvasRenderingContext2D, size: dimension, game: Engine): void {
        if(!this.rect_size || !this.board_size || !this.rect_pos || !this.board_pos) return;
        const cell_size: dimension = mapArrays(this.board_size, this.grid_size, (a, b) => a / b) as dimension;

        for (let xi = 0, x = this.board_pos[0]; xi < this.grid_size[0]; xi++, x += cell_size[0]) {
            for (let yi = 0, y = this.board_pos[1]; yi < this.grid_size[1]; yi++, y += cell_size[1]) {
                this.draw_element_fn && this.draw_element_fn(ctx, [Math.floor(xi), Math.floor(yi)], [Math.floor(x), Math.floor(y)], cell_size, game);
            }
        }
    }

    resize(_width: number, _height: number): void {
        const size = [_width, _height];
        this.rect_size = mapArrays(this.grid_size, mapArrays(size, this.size_ratio, (a,b) => a * b), (a, b) => b - b % a) as dimension;
        this.board_size = [...this.rect_size] as dimension;
        this.rect_pos = mapArrays(this.size_ratio, size, (a, b) => (.5 - (a / 2)) * b) as point;
        this.board_pos = [...this.rect_pos] as point;
        
        const rect_aspect_ratio = this.rect_size[0] / this.rect_size[1];
        if(rect_aspect_ratio > this.aspect_ratio){
            this.board_size[0] = this.aspect_ratio * this.board_size[1];
            this.board_pos[0] += (this.rect_size[0] - this.board_size[0]) / 2;
        } else {
            this.board_size[1] = this.board_size[0] / this.aspect_ratio;
            this.board_pos[1] += (this.rect_size[1] - this.board_size[1]) / 2;
        }
    }

    protected get_selected_cell_with_xy(x: number, y: number) : point | null {
        if(!this.board_pos || !this.board_size) return null;
        const cell_size: dimension = mapArrays(this.board_size, this.grid_size, (a, b) => a / b) as dimension;
        return [
            Math.floor((x - this.board_pos[0]) / cell_size[0]),
            Math.floor((y - this.board_pos[1]) / cell_size[1]),
        ];
    }

    mousemove(x: number, y: number, event: MouseEvent, game: Engine<GridContext>): void {
        const point = this.get_selected_cell_with_xy(x,y)
        if(!point) return;
        if(!game.context.selected_tile || game.context.selected_tile[0] != point[0] || game.context.selected_tile[1] != point[1]){
            this.selected_change_fn && this.selected_change_fn(point, game, event, game.context.selected_tile ?? null, );
        }
        game.setContext({
            selected_tile: point,
        })
    }

    override touchmove(x: number, y: number, touch: Touch, game: Engine<GridContext>, event: TouchEvent): void {
        const point = this.get_selected_cell_with_xy(x,y)
        if(!point) return;
        this.touch_fn && this.touch_fn(point, game, touch, event);
    }

    mousedown(x: number, y: number, event: MouseEvent, game: Engine<GridContext>): void {
        const point = this.get_selected_cell_with_xy(x,y)
        if(!point) return;
        this.click_fn && this.click_fn(point, game, event);
    }
}