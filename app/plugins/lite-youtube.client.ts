// Registers the <lite-youtube> custom element (a lightweight, click-to-load YouTube
// facade). Client-only: the package calls customElements.define(), which doesn't exist
// during SSR. Plugins run before hydration, so the element is defined by the time Vue
// hydrates the <lite-youtube> tags emitted on the server.
import 'lite-youtube-embed'

export default defineNuxtPlugin(() => {})
