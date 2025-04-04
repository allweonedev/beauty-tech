// File: /scripts/generate-api-types.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "../app/api");
const outputFile = path.resolve(__dirname, "../lib/generated-api-routes.ts");

// Get all API routes from the file system
function getApiRoutes(dir: string, basePath = "/api"): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Handle dynamic route folders [param]
      if (entry.name === "route.ts" || entry.name === "route.js") {
        return [basePath];
      }
      return getApiRoutes(fullPath, relativePath);
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      return [basePath];
    }

    return [];
  });
}

// Get HTTP methods for each route
function getHttpMethods(routePath: string): string[] {
  const routeFile = path.join(apiDir, routePath.substring(4), "route.ts");
  if (!fs.existsSync(routeFile)) return [];

  const content = fs.readFileSync(routeFile, "utf-8");
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  return methods.filter(
    (method) =>
      content.includes(`export async function ${method}`) ||
      content.includes(`export function ${method}`)
  );
}

// Generate the TypeScript interface
async function generateApiRouteMap() {
  const routes = getApiRoutes(apiDir);

  let output = `// Auto-generated API route map\n// DO NOT EDIT MANUALLY\n\n`;
  output += `export interface ApiRouteMap {\n`;

  for (const route of routes) {
    const methods = getHttpMethods(route);
    if (methods.length === 0) continue;

    // Fix: Use forward slashes consistently for the route key
    const normalizedRoute = route.replace(/\\/g, "/");
    output += `  '${normalizedRoute}': {\n`;

    for (const method of methods) {
      // Fix: Ensure the import path uses forward slashes and includes 'api'
      const importPath = route.substring(4).replace(/\\/g, "/");
      output += `    ${method}: typeof import('../app/api${importPath}/route').${method};\n`;
    }
    output += `  };\n`;
  }

  output += `}\n`;

  fs.writeFileSync(outputFile, output);

  console.log(`Generated API route map with ${routes.length} routes`);
}

// Run the generator
generateApiRouteMap().catch(console.error);
