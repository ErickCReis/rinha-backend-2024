import { init } from "@stricjs/app";
import { status } from "@stricjs/app/send";

init({
  routes: [import.meta.dir + "/src"],
  fallback: () => status(undefined, 404),
});
