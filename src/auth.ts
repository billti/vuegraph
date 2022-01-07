import { AccountInfo, Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
    auth: {
        // "Marketplace" app registration in the "billti.dev" AzureAD tenant
        clientId: "f9c0e95b-5075-49b8-a673-6eb1bc113cf4",
        authority: "https://login.microsoftonline.com/a8257b21-ac35-4244-9f9e-17c2ea736263",
        redirectUri: window.location.origin
    }
};

// Per MSAL docs, the popup redirect should have a (close to) blank page on the origin
// to both improve perf and avoid potential issues. (The page redirected to is not used
// for anything other than detecting the popup window URL has returned to the origin).
const popupRedirect = window.origin + "/popupRedirect.html";

const msalInstance = new msal.PublicClientApplication(msalConfig);
let currentUser: AccountInfo | null = null;

// TODO: Most of the below MSAL calls just return a Promise<AuthenticationResult>. Should probably unify handling.

// This wires up the redirect callback to ensure an account is signed in.
export function requireAccount(): Promise<AccountInfo> {
    return msalInstance.handleRedirectPromise().then(resp => {
        // This callback is always invoked, even if there was no auth redirect (i.e. it is called with null on regular page load).

        if (!resp) {
            // Not a sign-in redirect. Either the user must be signed in already, else need to do the sign-in redirect flow
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length < 1) {
                // Nobody signed in. On browser page load there has been no interaction (e.g. user click event), so have
                // to do the redirect flow, as popups will be blocked.
                // Note: This navigates the window to the AzureAD login page, so no further code executes after this call.
                msalInstance.loginRedirect();
            } else {
                // One or more accounts already signed-in. Could prompt the user which to use, but just default to the first
                // It seems rare in a single-tenant app you'd be signed in with multiple accounts at the same time.
                currentUser = currentAccounts[0];
            }
        } else {
            // It was a successful login redirect. "resp" with have properties such as idToken, accessToken, account.homeAccountId, username, etc.
            // account.homeAccountId is in "<oid>.<tid>" format, e.g. "f1136a33-0ece-40b1-a09f-57a2669aee65.72f988bf-86f1-41af-91ab-2d7cd011db47"
            currentUser = resp.account;
        }
        console.log(`Logged in as ${currentUser!.username}`);
        return currentUser!;
    }).catch(err => {
        // Just redirect back to the login page again on error. Note, the following 'throw' will never execute.
        msalInstance.loginRedirect();
        throw err;
    });
}

// TODO: This currently calls *Popup, so would need to only be called as part of interaction.
// For ease of use, this should return that the silent acquire failed so the user can call a popup.
export function acquireToken(scopes: string[]) {
    // Try to get the token silently. If that fails, the credentials (and refresh token) may have expired.
    let request = { scopes, account: currentUser!, redirectUri: popupRedirect };
    return msalInstance.acquireTokenSilent(request)
        .catch(err => {
            // TODO: Why isn't the "instanceof" check as per the samples working here? The instance is of type "AuthError"
            if (err.name === "InteractionRequiredAuthError") {
                return msalInstance.acquireTokenPopup(request);
            } else {
                throw err;
            }
        });
}

export function loginPopup(scopes: string[]) {
    return msalInstance.loginPopup({ scopes, account: currentUser!, redirectUri: popupRedirect });
}
