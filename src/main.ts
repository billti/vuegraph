import Layout from "./Layout.vue";
import Home from "./Home.vue";

import type { AccountInfo } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: "378c994d-2006-4fda-a0d7-5a72138c729c",
        authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
let currentUser: AccountInfo | null = null;

msalInstance.handleRedirectPromise().then(resp => {
    // This callback is always invoked, even if there was no auth redirect (i.e. is called with null on regular page load).

    if (!resp) {
        // Not a sign-in redirect. Either the user must be signed in already, else need to do the sign-in redirect flow
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts.length < 1) {
            // Nobody signed in. On browser page load there has been no interaction (e.g. user click event), so have
            // to do the redirect flow, as popups are blocked.
            // Note: This navigates the window to the AzureAD login page, so no further code executes after this call.
            msalInstance.loginRedirect();
        } else {
            // One or more accounts already signed-in. Could prompt the user which to use, but just default to the first
            // It seems highly unlikely in a single-tenant app you'd be signed in with multiple accounts at the same time.
            currentUser = currentAccounts[0];
        }
    } else {
        // It was a successful login redirect. "resp" with have properties such as idToken, accessToken, account.homeAccountId, username, etc.
        // account.homeAccountId is in "<oid>.<tid>" format, e.g. "f1136a33-0ece-40b1-a09f-57a2669aee65.72f988bf-86f1-41af-91ab-2d7cd011db47"
        currentUser = resp.account;
    }
    console.log(`Logged in as ${currentUser!.username}`);
}).catch(err => {
    console.log(`In handleRedirectPromise 'catch' handler for error: ${err}`);

    // Don't do any further processing (or maybe should try and do the login flow again, and detect/avoid a loop somehow?)
    throw err;
});

const routes = [
    { path: "/", component: Home }
];

const app = new Layout({
    vuetify: new Vuetify(),
    router: new VueRouter({ routes })
});
app.$mount("#app");

export default "v0.1";
