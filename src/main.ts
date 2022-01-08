import Layout from "./Layout.vue";
import Home from "./Home.vue";
import { requireAccount } from "./auth";

import type { RouteConfig } from "vue-router";

requireAccount().then(account => {
    if (!account) throw "No logged in account"; // Shouldn't happen.

    const routes: RouteConfig[] = [
        { path: "*", redirect: "/home"},
        { path: "/home", component: Home, name: "Home", meta: {icon: "mdi-view-dashboard"} },
        { path: "/accounts", component: Home, name: "Accounts", meta: {icon: "mdi-shield-account"} },
        { path: "/settings", component: {template: `<div>TODO: Settings</div>`}, name: "Settings", meta: {icon: "mdi-cog"} },
    ];
    
    const app = new Layout({
        vuetify: new Vuetify({theme: {dark: true}}),
        router: new VueRouter({ routes })
    });
    app.$mount("#app");

    (app as any).setUserName(account.name || "");
});
