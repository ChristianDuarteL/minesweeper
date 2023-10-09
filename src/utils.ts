import { LitElement } from "lit";

export function dispatch<T>(_this: LitElement, event: string, event_data?: EventInit & T){
    _this.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: event_data,
        ...event_data
    }))
}