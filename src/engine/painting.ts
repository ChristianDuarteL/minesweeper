const hexValues = '0123456789ABCDEF';

export class Color {

    // 0bRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA
    color: number = 0;

    constructor(color?: string){
        this.color = 0x000000FF;
        if(!color) return;
        color = color.replace('#', '').toUpperCase();
        if(color.length != 8 && color.length != 6) throw Error('The hex color is of an invalid length');
        for (let i = 0; i < color.length; i++) {
            const element = color[i];
            const n = hexValues.indexOf(element);
            if(n < 0) throw Error('Invalid hex color');
            this.color = (this.color << 4) | n;
        }
        if(color.length == 6){
            this.color = (this.color << 8) | 255;
        }
    }
    
    set r (r: number) {
        this.color = (this.color & 0x00ffffff) | ((r & 0xff) << 24);
    }

    set g (g: number) {
        this.color = (this.color & 0xff00ffff) | ((g & 0xff) << 16);
    }

    set b (b: number) {
        this.color = (this.color & 0xffff00ff) | ((b & 0xff) << 8);
    }

    set a (a: number) {
        this.color = (this.color & 0xffffff00) | (a & 0xff);
    }

    get r () {
        return (this.color >> 24) & 0xff;
    }

    get g () {
        return (this.color >> 16) & 0xff;
    }
    
    get b () {
        return (this.color >> 8) & 0xff;
    }

    get a () {
        return this.color & 0xff;
    }

    toHexString(){
        return '#' + this.r.toString(16).padStart(2, '0') + this.g.toString(16).padStart(2, '0') + this.b.toString(16).padStart(2, '0');
    }

    lerp(b: Color, t: number){
        const color = new Color();
        t = t > 1 ? 1 : t < 0 ? 0 : t;
        color.r = (1 - t) * this.r + b.r * t;
        color.g = (1 - t) * this.g + b.g * t;
        color.b = (1 - t) * this.b + b.b * t;
        color.a = (1 - t) * this.a + b.a * t;
        return color;
    }
}