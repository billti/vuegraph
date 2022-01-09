import App from "./App.vue";
import Home from "./Home.vue";
import { requireAccount } from "./auth";

import type { RouteConfig } from "vue-router";

requireAccount().then(account => {
    if (!account) throw "No logged in account"; // Shouldn't happen.

    const routes: RouteConfig[] = [
        { path: "*", redirect: "/home" },
        { path: "/home", component: Home, name: "Home", meta: { icon: "mdi-view-dashboard" } },
        { path: "/accounts", component: Home, name: "Accounts", meta: { icon: "mdi-shield-account" } },
        { path: "/settings", component: { template: `<div>TODO: Settings</div>` }, name: "Settings", meta: { icon: "mdi-cog" } },
    ];

    const vm = new App({
        el: "#app",
        vuetify: new Vuetify({ theme: { dark: true } }),
        router: new VueRouter({ routes }),
        propsData: {userName: account.name}
    });

    // TODO: Wire up account change event to: (name) => vm.$props.userName = name

    // Stick it on the window for ease of access when testing
    Object.defineProperty(globalThis, "vueApp", {value: vm});
});
