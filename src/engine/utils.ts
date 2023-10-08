import { dimension, point } from "./Engine";

export const getOrThrow: <T>(val: T | null | undefined) => T = <T>(val: T | null | undefined) => {
    if(!val){
        throw new TypeError('This type must not be null or undefined')
    }
    return val;
}

export const mapArrays: <A1, A2, R>(array1: A1[], array2: A2[], predicate: (a: A1, b: A2) => R) => R[] = (a, b, fn) => a.map((e, i) => fn(e, b[i]));

interface borders {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

type border_type = [ number, number ] | [ number, number, number, number] | number | borders;

const get_borders : (borders: border_type) => borders = (borders: border_type) => {
    if(Array.isArray(borders)){
        return {
            top: borders[0],
            right: borders[1],
            bottom: borders[2 % borders.length],
            left: borders[3 % borders.length],
        };
    }
    if(typeof borders == 'object') return borders;
    return {
        top: borders,
        right: borders,
        bottom: borders,
        left: borders,
    }
}

export const draw_line: (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => void = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

export const draw_borders: (ctx: CanvasRenderingContext2D, pos: point, size: dimension, borders: border_type) => void = (ctx, pos, size, borders) => {
    const b = get_borders(borders);
    
    if(b.top){
        ctx.lineWidth = b.top;
        draw_line(ctx, pos[0], pos[1], pos[0] + size[0], pos[1])
    }
    
    if(b.bottom){
        ctx.lineWidth = b.bottom;
        draw_line(ctx, pos[0], pos[1] + size[1], pos[0] + size[0], pos[1] + size[1])
    }

    if(b.left){
        ctx.lineWidth = b.left;
        draw_line(ctx, pos[0], pos[1], pos[0], pos[1] + size[1])
    }

    if(b.right){
        ctx.lineWidth = b.right;
        draw_line(ctx, pos[0] + size[0], pos[1], pos[0] + size[0], pos[1] + size[1])
    }
}
