import { onRequestPost as __api_checkout_js_onRequestPost } from "/home/claude/voute/functions/api/checkout.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/home/claude/voute/functions/api/contact.js"
import { onRequestGet as __api_restore_js_onRequestGet } from "/home/claude/voute/functions/api/restore.js"
import { onRequestPost as __api_restore_js_onRequestPost } from "/home/claude/voute/functions/api/restore.js"
import { onRequestGet as __api_verify_js_onRequestGet } from "/home/claude/voute/functions/api/verify.js"

export const routes = [
    {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/restore",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_restore_js_onRequestGet],
    },
  {
      routePath: "/api/restore",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_restore_js_onRequestPost],
    },
  {
      routePath: "/api/verify",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_verify_js_onRequestGet],
    },
  ]