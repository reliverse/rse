import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";

// @ts-expect-error <dler-remove-comment>
import { createRouter } from "./router";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
