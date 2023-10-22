export const lerpi = (a: number, b: number, t: number) => {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.round((1 - t) * a + b * t)
};