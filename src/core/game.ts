import seedrandom from "seedrandom";
import { LevelData } from "../views/level-selection";

interface Dimensions {
    width: number
    height: number
}

export class AbstractGame<T = number, M extends Dimensions = Dimensions> {
    game_data: M;
    data: T[][];

    constructor(level_data: M, default_value: () => T){
        this.game_data = level_data;
        this.data = new Array(this.game_data.height).fill(0).map(() => new Array(this.game_data.width).fill(default_value()));
    }

    get_tile<T>(x: number, y: number, default_val: T | null = null){
        return this.data && y >= 0 && y < this.data.length && x >= 0 && x < this.data[y].length ? this.data[y][x] : default_val;
    }

    get_tile_nullsafe<T>(x: number, y: number, default_val: T){
        return this.data && y >= 0 && y < this.data.length && x >= 0 && x < this.data[y].length ? this.data[y][x] : default_val;
    }

    set_tile(x: number, y: number, value: T){
        return this.data ? (this.data[y][x] = value) : null;
    }

    protected cloneInternal(game: AbstractGame<T>): AbstractGame<T> {
        if(game.data){
            for (let i = 0; i < game.data.length; i++) {
                for (let j = 0; j < game.data[i].length; j++) {
                    game.data[i][j] = this.data[i][j];
                }
            }
        }
        return game;
    }
}

export class Game extends AbstractGame<number, LevelData> {
    constructor(level_data: LevelData, generate_bombs = true){
        super(level_data, () => 0);
        if(generate_bombs) this.generate_bombs();
    }

    generate_bombs() {
        const random = seedrandom('hola');
        if(this.game_data.bombs / (this.game_data.width * this.game_data.height) > .5){
            const arr = new Array(this.game_data.width * this.game_data.height).fill(0).map((v, i) => [i % this.game_data.width, Math.floor(i / this.game_data.width)]);
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                const random_i = Math.floor(random.double() * arr.length);
                arr[i] = arr[random_i];
                arr[random_i] = element;
            }
            for (let i = 0; i < this.game_data.bombs; i++) {
                const element = arr[i];
                this.set_tile(element[0], element[1], 1);
            }
            return;
        }
        for (let i = 0; i < this.game_data.bombs; i++) {
            const random_w = Math.floor(random.double() * this.game_data.width);
            const random_h = Math.floor(random.double() * this.game_data.height);
            if(this.get_tile(random_w, random_h)){
                i--;
                continue;
            }
            this.set_tile(random_w, random_h, 1);
        }
    }

    surrounding_bombs(x: number, y: number): number {
        return this.get_tile_nullsafe(x + 1, y + 1, 0) + 
        this.get_tile_nullsafe(x + 1, y, 0) + 
        this.get_tile_nullsafe(x + 1, y - 1, 0) + 
        this.get_tile_nullsafe(x, y + 1, 0) + 
        this.get_tile_nullsafe(x, y - 1, 0) + 
        this.get_tile_nullsafe(x - 1, y + 1, 0) + 
        this.get_tile_nullsafe(x - 1, y, 0) + 
        this.get_tile_nullsafe(x - 1, y - 1, 0);
    }

    clone(){
        return this.cloneInternal(new Game(this.game_data, false));
    }
}