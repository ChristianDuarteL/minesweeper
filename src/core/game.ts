import seedrandom from "seedrandom";
import { LevelData } from "../views/level-selection";

export class Game {
    level_data: LevelData;
    data: number[][];

    constructor(level_data: LevelData, generate_bombs = true){
        this.level_data = level_data;
        this.data = new Array(this.level_data.height).fill(0).map(() => new Array(this.level_data.width).fill(0));
        if(generate_bombs) this.generate_bombs();
    }

    generate_bombs() {
        const random = seedrandom('hola');
        if(this.level_data.bombs / (this.level_data.width * this.level_data.height) > .5){
            const arr = new Array(this.level_data.width * this.level_data.height).fill(0).map((v, i) => [i % this.level_data.width, Math.floor(i / this.level_data.width)]);
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                const random_i = Math.floor(random.double() * arr.length);
                arr[i] = arr[random_i];
                arr[random_i] = element;
            }
            for (let i = 0; i < this.level_data.bombs; i++) {
                const element = arr[i];
                this.set_tile(element[0], element[1], 1);
            }
            return;
        }
        for (let i = 0; i < this.level_data.bombs; i++) {
            const random_w = Math.floor(random.double() * this.level_data.width);
            const random_h = Math.floor(random.double() * this.level_data.height);
            if(this.get_tile(random_w, random_h)){
                i--;
                continue;
            }
            this.set_tile(random_w, random_h, 1);
        }
    }

    get_tile(x: number, y: number){
        return this.data ? this.data[y][x] : null;
    }

    set_tile(x: number, y: number, value: number){
        return this.data ? (this.data[y][x] = value) : null;
    }

    clone(): Game {
        const game = new Game(this.level_data);
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