import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  outfile: "out/extension.js",
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: "node",
  external: ["vscode"],
});
