declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

// Vuetify doesn't export as a UMD type, so declare it here.
declare var Vuetify: typeof import("vuetify").default;

// Pull in the VueRouter definition explicitly from the package
// This also augments the Vue instances with $route and $router
declare var VueRouter: typeof import("vue-router").default;

declare var msal: typeof import("@azure/msal-browser");
