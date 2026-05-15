import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "8080";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const corepack = process.platform === "win32" ? "corepack.cmd" : "corepack";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: options.shell ?? false,
      env: { ...process.env, ...options.env },
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function runPnpm(args) {
  try {
    await run(corepack, ["pnpm", ...args], { shell: process.platform === "win32" });
  } catch {
    await run(pnpm, args, { shell: process.platform === "win32" });
  }
}

if (!existsSync(path.join(root, "node_modules", ".modules.yaml"))) {
  console.log("Installing dependencies...");
  await runPnpm(["install"]);
}

console.log("Building Cadmea frontend...");
await runPnpm(["--filter", "@workspace/cadmea", "run", "build"]);

console.log("Building API server...");
await runPnpm(["--filter", "@workspace/api-server", "run", "build"]);

console.log(`Starting http://localhost:${port}/`);
await run(process.execPath, ["artifacts/api-server/dist/index.mjs"], {
  env: { PORT: port },
});
