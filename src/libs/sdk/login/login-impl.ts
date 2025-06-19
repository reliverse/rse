import type { ParsedUrlQuery } from "querystring";

import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { useSpinner } from "@reliverse/rempts";
import { listen } from "async-listen";
import http from "http";
import { customAlphabet } from "nanoid";
import "dotenv/config";
import { setTimeout } from "node:timers";
import open from "open";
import url from "url";

import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import { cliDomainDocs, memoryPath } from "~/libs/sdk/constants";
import { showAnykeyPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showAnykeyPrompt";
import { getOrCreateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { updateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";

/**
 * Custom error for when a user cancels the process.
 */
class UserCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserCancellationError";
  }
}

const nanoid = customAlphabet("123456789QAZWSXEDCRFVTGBYHNUJMIKOLP", 5);

export async function auth({
  isDev,
  useLocalhost,
}: {
  isDev: boolean;
  useLocalhost: boolean;
}) {
  relinka("info", "Let's authenticate you...");

  const spinner = useSpinner({
    text: "Waiting for user confirmation...",
  }).start();

  try {
    // Create a local HTTP server to handle the authentication callback
    const server = http.createServer();
    let port: number | string | undefined;

    try {
      const serverListen = await listen(server, {
        port: 0,
        host: "localhost",
      });
      port = serverListen.port;
      relinka("verbose", `Local server listening on http://localhost:${port}`);
    } catch (listenError) {
      relinka(
        "error",
        "Failed to start local server:",
        listenError instanceof Error
          ? listenError.message
          : String(listenError),
      );
      throw listenError;
    }

    // Handle incoming requests (auth or cancellation)
    const authPromise = new Promise<ParsedUrlQuery>((resolve, reject) => {
      server.on("request", (req, res) => {
        relinka("verbose", `Received ${req.method} request on ${req.url}`);

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );

        if (req.method === "OPTIONS") {
          relinka("verbose", "Handling OPTIONS request");
          res.writeHead(200);
          res.end();
        } else if (req.method === "GET") {
          const parsedUrl = url.parse(req.url ?? "", true);
          const queryParams = parsedUrl.query;
          relinka(
            "verbose",
            `Parsed query parameters: ${JSON.stringify(queryParams)}`,
          );

          if (queryParams.cancelled) {
            relinka("verbose", "User cancelled the login process...");
            relinka("verbose", "Sleep 2s to finish the fetch process...");
            void new Promise((r) => setTimeout(r, 2000)).then(() => {
              res.writeHead(200);
              res.end();
              server.close();
              reject(
                new UserCancellationError("Login process cancelled by user."),
              );
            });
            return;
          } else {
            relinka(
              "verbose",
              `Received authentication data: ${JSON.stringify(queryParams)}`,
            );
            res.writeHead(200);
            res.end();
            resolve(queryParams);
          }
        } else {
          relinka("error", `Unhandled request method: ${req.method}`);
          res.writeHead(405);
          res.end();
        }
      });

      server.on("error", (error) => {
        relinka(
          "error",
          "Local server encountered an error:",
          error instanceof Error ? error.message : String(error),
        );
        reject(error);
      });
    });

    const redirect = `http://localhost:${port}`;
    const code = nanoid();
    const clientUrl = isDev
      ? useLocalhost
        ? "http://localhost:3000"
        : "https://reliverse.org"
      : "https://reliverse.org";
    relinka("verbose", `Using client URL: ${clientUrl}`);

    const confirmationUrl = new URL(`${clientUrl}/auth/confirm`);
    confirmationUrl.searchParams.append("code", code);
    confirmationUrl.searchParams.append("redirect", redirect);

    process.stdout.write("\x1b[2K\r"); // Clear the current line, so misplacement of "Waiting for user confirmation..." is overwritten
    relinka(
      "log",
      "The following URL will be opened in your default browser (use Ctrl+Click to open):",
      confirmationUrl.toString(),
    );

    // Open the URL in the default browser
    try {
      await open(confirmationUrl.toString());
      relinka("verbose", "Opened browser with confirmation URL.");
    } catch (error) {
      relinka(
        "error",
        "Failed to open the browser automatically:",
        error instanceof Error ? error.message : String(error),
      );
      relinka(
        "error",
        "Please manually open the following URL in your browser:",
        confirmationUrl.toString(),
      );
    }

    spinner.setText(
      ` Please visit it and confirm there if you see the same code: ${re.bold(
        code,
      )}`,
    );

    // Set up a 5-minute timeout
    const authTimeout = setTimeout(
      () => {
        // Timeout scenario
        relinka("error", "Authentication timed out.");
        server.close(() => {
          relinka("error", "Local server closed due to timeout.");
          process.exit(1);
        });
      },
      5 * 60 * 1000,
    );

    try {
      const authData = await authPromise;
      clearTimeout(authTimeout);
      relinka(
        "verbose",
        `Authentication data received: ${JSON.stringify(authData)}`,
      );

      if (authData.cancelled) {
        throw new UserCancellationError("Login process cancelled by user.");
      }

      // Store auth data in memory instead of config
      await updateReliverseMemory({
        code: authData.code as string,
        key: authData.key as string,
      });

      server.close(() => {
        relinka(
          "verbose",
          "Wrote auth data to memory. To view it, type:",
          `code ${memoryPath}`,
        );
        relinka(
          "verbose",
          "Local server closed after successful authentication.",
        );
      });

      spinner.stop();
      relinka("log", cliDomainDocs);
      return;
    } catch (error) {
      clearTimeout(authTimeout);
      if (error instanceof UserCancellationError) {
        // User cancelled scenario: let's end gracefully
        spinner.setText("Login cancelled. See you next time 👋");
        server.close(() => {
          relinka("verbose", "Local server closed due to user cancellation.");
          process.exit(0);
        });
      } else {
        server.close(() => {
          relinka(
            "verbose",
            "Local server closed due to authentication failure.",
          );
        });
        spinner.stop();
        throw error;
      }
    }
  } catch (error) {
    spinner.stop();
    relinka("error", "Authentication failed!");
    throw error;
  }
}

export async function authCheck(
  isDev: boolean,
  memory: ReliverseMemory,
  useLocalhost: boolean,
) {
  // Check for existing authentication in SQLite
  const isAuthenticated =
    memory.code && memory.code !== "" && memory.key && memory.key !== "";

  if (!isAuthenticated) {
    await showAnykeyPrompt();
    await auth({ isDev, useLocalhost });

    // Re-check authentication after auth flow
    const updatedMemory = await getOrCreateReliverseMemory();

    const authSuccess =
      updatedMemory.code &&
      updatedMemory.code !== "" &&
      updatedMemory.key &&
      updatedMemory.key !== "";

    if (!authSuccess) {
      relinka("error", "Authentication failed. Please try again.");
      process.exit(1);
    }
  }
}
