import { w as writable } from "./index.js";
function detectTheme() {
  return "light";
}
const theme = writable(detectTheme());
function applyTheme(next) {
  return;
}
theme.subscribe((value) => applyTheme());
export {
  theme as t
};
