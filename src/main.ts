import Layout from "./Layout.vue";
import Home from "./Home.vue";
import { requireAccount } from "./auth";

import type { RouteConfig } from "vue-router";

requireAccount().then(account => {
    console.log("Welcome, %s!", account.name);

    const routes: RouteConfig[] = [
        { path: "*", redirect: "/home"},
        { path: "/home", component: Home, name: "Home", meta: {icon: "mdi-view-dashboard"} },
        { path: "/accounts", component: Home, name: "Accounts", meta: {icon: "mdi-shield-account"} },
        { path: "/settings", component: {template: `<div>TODO: Settings</div>`}, name: "Settings", meta: {icon: "mdi-cog"} },
    ];
    
    const app = new Layout({
        vuetify: new Vuetify(),
        router: new VueRouter({ routes })
    });
    app.$mount("#app");    
});

export default "v0.1";
