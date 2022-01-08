/// <reference types="vue" />

// Vue itself is declared as a UMD module in it's .d.ts file (i.e. 'export as namespace Vue'), thus
// no need to declare it's global here, simply reference its types as done in line 1 above.

// Vuetify and VueRouter don't export as a UMD type, so declare those globals here.
// Note: VueRouter also augments the Vue instances with $route and $router
declare var VueRouter: typeof import("vue-router").default;
declare var Vuetify: typeof import("vuetify").default;

// Give all Vue components the Vue type
declare module "*.vue" {
    export default Vue;
}

// MSAL.js  and axios will be loaded as global scripts. Declare the globals they introduce here.
declare var msal: typeof import("@azure/msal-browser");
declare var axios: typeof import("axios").default;
