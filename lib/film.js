// The Santa's-hands opening film. One film, generated once, used for every order.
// `page` is where the blank sheet sits in the film's final frame, as fractions of the frame.
// Clear `src` (or set NEXT_PUBLIC_FILM_URL to "none") to fall back to the drawn envelope animation.
const src = process.env.NEXT_PUBLIC_FILM_URL || "/film/open.mp4";
export const FILM = { src: src === "none" ? "" : src, aspect: 1080 / 1920, page: { x: 0.1235, y: 0.125, w: 0.706, h: 0.584 } };
export const hasFilm = () => !!FILM.src;
