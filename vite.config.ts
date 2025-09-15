import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    define: {},
    css: {
      postcss: './postcss.config.cjs',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "https://re7-rema-il93.ariane-suivi-social.net",
          changeOrigin: true,
          secure: true,
          // Pour que le cookie soit bien relayé
          cookieDomainRewrite: "localhost",
        },
      },
    },
  };
});
