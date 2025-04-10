/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./App";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const elem = document.getElementById("root")!;
const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	const root = (import.meta.hot.data.root ??= createRoot(elem));
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
