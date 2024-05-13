import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  //   shims: true,
  splitting: false,
  sourcemap: true,
  //   skipNodeModulesBundle: false,
  clean: true,
});
