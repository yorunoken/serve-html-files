import { serve } from "bun";
import { readFileSync } from "fs";
import { join } from "path";
import fs from "fs";

const rootDir = "./public";
const port = process.env.PORT;

serve({
    port: port,
    fetch(req) {
        const url = new URL(req.url);

        if (url.pathname.startsWith("/api/")) {
            return handleApiRequest(req, url);
        }

        let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
        try {
            const fullPath = join(rootDir, filePath);
            const content = readFileSync(fullPath, "utf-8");
            return new Response(content, {
                headers: { "Content-Type": getContentType(filePath) },
            });
        } catch (err) {
            return new Response("File not found", { status: 404 });
        }
    },
});

console.log("Server is running at http://localhost:" + port);

async function handleApiRequest(req: Request, url: URL) {
    switch (url.pathname) {
        case "/api/files":
            if (req.method === "GET") {
                const fileArray = fs.readdirSync(rootDir);

                return new Response(JSON.stringify({ files: fileArray }), {
                    headers: { "Content-Type": "application/json" },
                });
            }
            break;

        default:
            return new Response("API endpoint not found", { status: 404 });
    }

    return new Response("Method not allowed", { status: 405 });
}

function getContentType(filePath: string) {
    if (filePath.endsWith(".html")) return "text/html";
    if (filePath.endsWith(".css")) return "text/css";
    if (filePath.endsWith(".js")) return "application/javascript";
    if (filePath.endsWith(".png")) return "image/png";
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
    return "text/plain";
}
