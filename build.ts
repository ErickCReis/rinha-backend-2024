const glob = new Bun.Glob("**/*.routes.ts");
const routes = [...glob.scanSync("src")].map((file) => `src/${file}`);

await Bun.build({
  entrypoints: ["./index.ts", ...routes],
  outdir: "./dist",
  target: "bun",
  splitting: true,
  minify: true,
});
