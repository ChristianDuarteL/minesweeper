import { Clock } from "./Clock";
import { getOrThrow } from "./utils";

export type point = [number, number];
export type dimension = [number, number];

export class Entity {
    zIndex: number;
    
    constructor(zIndex = 0) {
        this.zIndex = zIndex;
    }
    
    /* eslint-disable @typescript-eslint/no-unused-vars */
    init(_game: Engine) {}
    dispose(_game: Engine) {}
    update(_game: Engine) {}
    lateUpdate(_game: Engine) {}
    draw(_ctx: CanvasRenderingContext2D, _size: dimension, _game: Engine) {}
    keydown(_key: string, _event: KeyboardEvent, _game: Engine) {}
    mousedown(_x: number, _y: number, _event: MouseEvent, _game: Engine) {}
    mouseup(_x: number, _y: number, _event: MouseEvent, _game: Engine) {}
    mousemove(_x: number, _y: number, _event: MouseEvent, _game: Engine) {}
    touchmove(_x: number, _y: number, _touch: Touch, _game: Engine, _touch_evnt: TouchEvent) {}
    click(_x: number, _y: number, _event: MouseEvent, _game: Engine) {}
    resize(_width: number, _height: number, _game: Engine) {}
    /* eslint-enable @typescript-eslint/no-unused-vars */
}

export class FPSCounter extends Entity{
    draw(ctx: CanvasRenderingContext2D, _size: dimension, _game: Engine): void {
        ctx.fillStyle = "#fff"
        ctx.strokeStyle = "#000";
        
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = `20px sans-serif`;

        ctx.fillText((1/_game.deltaTime).toFixed(0), 0, 0);
    }
}

interface DefaultEngineEventMap {
}

type WithUndefined<T> = {
    [P in keyof T]?: T[P];
}

type Func<TArgs extends unknown[], TResult = void> = (...args: TArgs) => TResult; 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Timer<M extends unknown[] = any[]>{
    time: number;
    function: Func<M, void>;
    params: M;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Engine<ContextType = any, EngineEventMap extends { [key: string]: any } = DefaultEngineEventMap> {
    entities: Entity[];
    private entities_map: Map<string, Entity[]>;
    private clock: Clock;
    private canvas: HTMLCanvasElement;
    private canvas_ctx: CanvasRenderingContext2D;
    private looping: boolean = false;
    private animation_frame: number | null = null;
    private event_functions: Map<keyof DocumentEventMap, EventListenerOrEventListenerObject>;
    private event_target: EventTarget = new EventTarget();
    canvas_size: dimension;
    context: ContextType;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timers: Timer<any>[] = [];

    get canvas_styles() : CSSStyleDeclaration{
        return this.canvas.style;
    }

    constructor(canvas: HTMLCanvasElement, context: ContextType){
        this.entities = [];
        this.entities_map = new Map();
        this.event_functions = new Map();
        this.clock = new Clock(performance.now());
        this.canvas = canvas;
        this.canvas_ctx = getOrThrow(canvas.getContext('2d'));
        this.canvas_size = [ this.canvas.width, this.canvas.height ];
        this.context = Object.freeze(context);
        this.addListeners();
    }

    dispatchEvent(evt: CustomEvent){
        this.event_target.dispatchEvent(evt)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeEventListener<K extends keyof EngineEventMap>(type: K, listener: (ev: CustomEvent<EngineEventMap[K]>) => any, options?: boolean | AddEventListenerOptions){
        this.event_target.removeEventListener(type as string, listener as EventListener, options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addEventListener<K extends keyof EngineEventMap>(type: K, listener: (ev: CustomEvent<EngineEventMap[K]>) => any, options?: boolean | AddEventListenerOptions){
        this.event_target.addEventListener(type as string, listener as EventListener, options)
    }

    addListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => void){
        document.addEventListener(type, listener);
        this.event_functions.set(type, listener as EventListenerOrEventListenerObject);
    }
    
    removeListener(type: keyof DocumentEventMap){
        const n = this.event_functions.get(type);
        if(!n) return;
        document.removeEventListener(type, n);
    }

    addListeners(){
        this.addListener('keydown', this.keydown.bind(this));
        this.addListener('mousedown', this.mousedown.bind(this));
        this.addListener('mouseup', this.mouseup.bind(this));
        this.addListener('mousemove', this.mousemove.bind(this));
        this.addListener('touchmove', this.touchmove.bind(this));
    }

    removeListeners(){
        this.removeListener('keydown');
        this.removeListener('mousedown');
        this.removeListener('mouseup');
        this.removeListener('mousemove');
        this.removeListener('touchmove');
    }

    dispose(){
        this.stopLoop();
        this.removeAll();
        this.removeListeners();
    }
    
    addEntity(entity: Entity){
        this.entities.push(entity);
        this.entities = this.entities.sort((a, b) => a.zIndex - b.zIndex);
        if(!this.entities_map.has(entity.constructor.name)){
            this.entities_map.set(entity.constructor.name, [])
        }
        this.entities_map.get(entity.constructor.name)?.push(entity);
        entity.init(this);
    }
    
    getEntitiesOfType(class_name: string){
        return this.entities_map.get(class_name);
    }
    
    getEntityOfType(class_name: string){
        return (this.entities_map.get(class_name) ?? [null]) [0] ?? null;
    }
    
    removeAll(){
        this.entities.forEach(e => e.dispose(this));
        this.entities = [];
        this.entities_map = new Map();
    }

    removeEntity(entity: Entity){
        const f = (e: Entity) => e !== entity; 
        const entities_class = entity.constructor.name;
        const n = this.entities_map.get(entities_class);
        n && this.entities_map.set(entities_class, n.filter(f));
        const entities = this.entities;
        this.entities = this.entities.filter(f);
        entities.length !== this.entities.length && entity.dispose(this);
    }
    
    removeEntitiesOfType(class_name: string){
        const entities_removed = this.entities.filter(e => e.constructor.name === class_name);
        entities_removed.forEach(e => e.dispose(this));
        this.entities = this.entities.filter(e => e.constructor.name !== class_name);
        this.entities_map.delete(class_name);
    }
    
    protected doLoop(time?: number){
        if(!this.looping)
            return;
        time && this.clock.tick(time);
        
        if(this.timers.length){
            this.timers.forEach(e => e.time -= this.clock.deltaTime);
            const timers_done = this.timers.filter(e => e.time <= 0);
            if(timers_done.length){
                this.timers = this.timers.filter(e => e.time > 0);
                timers_done.forEach(e => {
                    e.function(...e.params);
                })
            }
        }

        this.update();
        this.redraw();
        this.looping && (this.animation_frame = requestAnimationFrame(this.doLoop.bind(this)));
    }

    startLoop(){
        if(this.looping) return;
        this.looping = true;
        this.doLoop();
    }

    stopLoop(){
        this.looping = false;
        this.animation_frame !== null && cancelAnimationFrame(this.animation_frame)
        this.animation_frame = null;
    }
    
    update(){
        this.entities.forEach(e => e.update(this));
        this.entities.forEach(e => e.lateUpdate(this));
    }
    
    draw(ctx: CanvasRenderingContext2D, size: dimension, game: Engine) {
        ctx.clearRect(0, 0, ...size);
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff';
        this.entities.forEach(e => e.draw(ctx, size, game));
    }

    redraw() {
        this.draw(this.canvas_ctx, this.canvas_size, this);
    }
    
    keydown(event: KeyboardEvent) {
        this.entities.forEach(e => e.keydown(event.key, event, this))
    }

    click(event: MouseEvent) {
        const pos: point = this.getXY(event);
        this.entities.forEach(e => e.click(...pos, event, this))
    }

    mousedown(event: MouseEvent) {
        const pos: point = this.getXY(event);
        this.entities.forEach(e => e.mousedown(...pos, event, this));
    }

    mouseup(event: MouseEvent) {
        const pos: point = this.getXY(event);
        this.entities.forEach(e => e.mouseup(...pos, event, this));
    }

    mousemove(event: MouseEvent) {
        const pos: point = this.getXY(event);
        this.entities.forEach(e => e.mousemove(...pos, event, this))
    }
    
    touchmove(event: TouchEvent) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const element = event.changedTouches[i];
            const pos: point = this.getXY(element);
            this.entities.forEach(e => e.touchmove(...pos, element, this, event))
        }
    }

    setTimeout<M extends unknown[]>(timeout: number, fn: Func<M, void>, ...params: M){
        const timer: Timer<M> = {
            function: fn,
            time: timeout,
            params: params
        }
        this.timers.push(timer);
    }

    get deltaTime() {
        return this.clock.deltaTime;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setContext(value: WithUndefined<ContextType>) {
        this.context = { ...this.context, ...value};
    }

    getXY(value: {clientX: number, clientY: number} | {x: number, y: number} | point): point{
        let x = 0;
        let y = 0;
        if(Array.isArray(value)){
            x = value[0];
            y = value[1];
        }else{
            x = 'clientX' in value ? value.clientX : value.x;
            y = 'clientY' in value ? value.clientY : value.y;
        }
        return [(x - this.canvas.offsetLeft) * window.devicePixelRatio, (y - this.canvas.offsetTop) * window.devicePixelRatio];
    }

    setSize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas_size = [width, height];
        this.entities.forEach(e => e.resize(width, height, this))
        this.redraw();
    }
}