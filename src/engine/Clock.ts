export class Clock {
    lastTime = 0;
    deltaTime = 0;
    
    constructor(lastTime: number) {
        this.lastTime = lastTime;
    }
    
    tick(time: number){
        if (time < this.lastTime) return;
        this.deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
    }
}