import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = normalize(__filename.replace(/\\serve\.mjs$/, ""));
const port = Number(process.env.PORT || 4173);

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8"
};

function resolvePath(urlPath) {
  const cleanPath = (urlPath || "/").split("?")[0].split("#")[0];
  const requestPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const normalized = normalize(requestPath).replace(/^([.][.][/\\])+/, "");
  return join(root, normalized);
}

createServer((req, res) => {
  const filePath = resolvePath(req.url || "/");

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    const fallbackPath = join(root, "404.html");
    if (existsSync(fallbackPath)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      createReadStream(fallbackPath).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const type = mimeByExt[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`newsite preview running at http://localhost:${port}`);
});
