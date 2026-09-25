/**
 * Starts the AdsConnect .NET API with a connection string derived from the
 * DATABASE_URL already in .env, so there is nothing extra to configure and no
 * second copy of the password to keep in sync.
 *
 *   bun run api
 *
 * The value is passed to the child process in memory only — it is never written
 * to appsettings.json or anywhere else on disk. Running the API from Visual
 * Studio instead needs user-secrets; see ../backend/README.md.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const apiProject = resolve(here, "../../backend/AdsConnect.api");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and fill in your password.");
  process.exit(1);
}

let connectionString;
try {
  const u = new URL(databaseUrl);
  connectionString = [
    `Host=${u.hostname}`,
    `Port=${u.port || 5432}`,
    `Database=${decodeURIComponent(u.pathname.slice(1))}`,
    `Username=${decodeURIComponent(u.username)}`,
    `Password=${decodeURIComponent(u.password)}`,
  ].join(";");
} catch (error) {
  console.error(`DATABASE_URL is not a valid URL: ${error.message}`);
  process.exit(1);
}

const apiUrl = (process.env.API_BASE_URL ?? "http://localhost:5036").replace(/\/$/, "");
console.log(`Starting AdsConnect.api on ${apiUrl} ...`);

const child = spawn("dotnet", ["run", "--no-launch-profile"], {
  cwd: apiProject,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    ASPNETCORE_ENVIRONMENT: "Development",
    ASPNETCORE_URLS: apiUrl,
    ConnectionStrings__PostgresConnectionString: connectionString,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
