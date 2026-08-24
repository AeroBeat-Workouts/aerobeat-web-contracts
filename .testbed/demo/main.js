// @ts-check

/**
 * Demo root used by future contract examples.
 *
 * @type {HTMLElement | null}
 */
const app = document.querySelector("#app");

if (app instanceof HTMLElement) {
  app.textContent = "AeroBeat web contracts are exported from src/index.js.";
}
