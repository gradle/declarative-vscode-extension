import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.js",
  bundle: true,
  minify: true,
  platform: "node",
  external: ["vscode"],
});
