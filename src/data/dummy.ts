import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie } from "@tanstack/react-start/server";

export const dummySetCookie = createServerFn({ method: "POST" }).handler(async () => {
  setCookie("dummy", "value", { path: "/" });
  return { ok: true };
});

export const dummyDeleteCookie = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("dummy", { path: "/" });
  return { ok: true };
});
