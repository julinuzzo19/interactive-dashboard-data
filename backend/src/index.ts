import { App } from "./config/app";

async function main() {
  const app = new App(process.env.PORT);
  await app.listen();
}

main();
