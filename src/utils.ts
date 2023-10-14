import { LitElement } from "lit";
import { point } from "./engine/Engine";

export function dispatch<T>(_this: LitElement, event: string, event_data?: EventInit & T){
    _this.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: event_data,
        ...event_data
    }))
}

type PointPointOperation = (x1: number, y1: number, x2: number, y2?: number) => point;

export const addPositions: PointPointOperation = (x1, y1, x2, y2) => [x1 + x2, y1 + (y2 ?? x2)];
export const substractPositions: PointPointOperation = (x1, y1, x2, y2) => [x1 - x2, y1 - (y2 ?? x2)];
export const multiplyPositions: PointPointOperation = (x1, y1, x2, y2) => [x1 * x2, y1 * (y2 ?? x2)];
export const dividePositions: PointPointOperation = (x1, y1, x2, y2) => [x1 / x2, y1 / (y2 ?? x2)];
