// The Santa's-hands opening films. Generated once, used for every order.
// `page` is where the blank sheet sits in the film's final frame, and `env` is where the sealed
// envelope sits in its first frame (centre x/y, width, and width÷height), all as fractions of the frame.
// Set NEXT_PUBLIC_FILM_URL to "none" to fall back to the drawn envelope animation.
const off = process.env.NEXT_PUBLIC_FILM_URL === "none";
export const FILMS = {
  tall: { src: "/film/open.mp4", poster: "/film/first.jpg", aspect: 1080 / 1920, page: { x: 0.1235, y: 0.125, w: 0.706, h: 0.584 }, env: { x: 0.5, y: 0.472, w: 0.725, ratio: 1.58 } },
  wide: { src: "/film/open-wide.mp4", poster: "/film/first-wide.jpg", aspect: 1920 / 1080, page: { x: 0.3394, y: 0.0657, w: 0.2849, h: 0.685 }, env: { x: 0.4815, y: 0.484, w: 0.3, ratio: 1.78 } },
};
export const hasFilm = () => !off;
