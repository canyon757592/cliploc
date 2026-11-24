import { onRequestPost as __api_checkout_js_onRequestPost } from "/home/claude/voute/functions/api/checkout.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/home/claude/voute/functions/api/contact.js"
import { onRequestGet as __api_livre_js_onRequestGet } from "/home/claude/voute/functions/api/livre.js"
import { onRequestGet as __api_restore_js_onRequestGet } from "/home/claude/voute/functions/api/restore.js"
import { onRequestPost as __api_restore_js_onRequestPost } from "/home/claude/voute/functions/api/restore.js"
import { onRequestGet as __api_verify_js_onRequestGet } from "/home/claude/voute/functions/api/verify.js"
import { onRequest as __prive___rest___js_onRequest } from "/home/claude/voute/functions/prive/[[rest]].js"
import { onRequest as __tools___rest___js_onRequest } from "/home/claude/voute/functions/tools/[[rest]].js"

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
      routePath: "/api/livre",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_livre_js_onRequestGet],
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
  {
      routePath: "/prive/:rest*",
      mountPath: "/prive",
      method: "",
      middlewares: [],
      modules: [__prive___rest___js_onRequest],
    },
  {
      routePath: "/tools/:rest*",
      mountPath: "/tools",
      method: "",
      middlewares: [],
      modules: [__tools___rest___js_onRequest],
    },
  ]