import Layout from "./Layout.vue";
import Home from "./Home.vue";
import { requireAccount } from "./auth";

requireAccount().then(account => {
    console.log("Welcome, %s!", account.name);

    const routes = [
        { path: "/", component: Home }
    ];
    
    const app = new Layout({
        vuetify: new Vuetify(),
        router: new VueRouter({ routes })
    });
    app.$mount("#app");    
});

export default "v0.1";
