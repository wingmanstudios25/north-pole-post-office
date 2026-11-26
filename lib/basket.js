// The basket lives in the visitor's own browser. Nothing is stored on the server until they pay.
const KEY = "npo_basket";
export const readBasket = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } };
export const writeBasket = (ids) => { try { localStorage.setItem(KEY, JSON.stringify([...new Set(ids)])); } catch { } window.dispatchEvent(new Event("npo-basket")); };
export const addToBasket = (id) => writeBasket([...readBasket(), id]);
export const removeFromBasket = (id) => writeBasket(readBasket().filter((x) => x !== id));
