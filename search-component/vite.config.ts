import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

/**
 * Vite plugin that duplicates the emitted entry chunk to `index.js`
 * so consumers always have a stable filename in addition to the hashed one.
 */
function duplicateEntryPlugin() {
  return {
    name: "duplicate-entry-plugin",
    writeBundle(options: any, bundle: Record<string, any>) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.isEntry) {
          const destDir = options.dir ?? path.dirname(options.file!);
          const source = path.join(destDir, fileName);
          const dest = path.join(destDir, "index.js");
          fs.copyFileSync(source, dest);
          break; // only need the first entry chunk
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), duplicateEntryPlugin()],
  server: {
    port: 5173,
  },
});
