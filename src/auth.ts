import { AccountInfo, AuthenticationResult, Configuration, PopupRequest } from "@azure/msal-browser";

const logDetails = true;

export const appScope = "api://f9c0e95b-5075-49b8-a673-6eb1bc113cf4/access_as_user";

// Below is for the "Marketplace" app registration in the "billti.dev" AzureAD tenant
const msalConfig: Configuration = {
    auth: {
        clientId: "f9c0e95b-5075-49b8-a673-6eb1bc113cf4",
        authority: "https://login.microsoftonline.com/a8257b21-ac35-4244-9f9e-17c2ea736263",
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin
    }
};

if (logDetails) {
    msalConfig.system = {
        loggerOptions: {
            logLevel: msal.LogLevel.Info,
            piiLoggingEnabled: true,
            loggerCallback: (level, msg) => { console.log("MSAL: Level: %d: %s", level, msg); }
        }
    }
}

const msalInstance = new msal.PublicClientApplication(msalConfig);
let currentUser: AccountInfo | null = null;

// Per MSAL docs, the popup redirect should be a (close to) blank page on the origin
// to both improve perf and avoid potential issues. (The page redirected to is not used
// for anything other than detecting the popup window URL has returned to the origin).
const popupRedirect = window.origin + "/popupRedirect.html";

// This wires up the redirect callback to ensure an account is signed in.
export function requireAccount(): Promise<AccountInfo | null> {
    return msalInstance.handleRedirectPromise().then(resp => {
        // This callback is always invoked, even if there was no auth redirect (i.e. it is called with null on regular page load).
        if (!resp) {
            // Not a sign-in redirect. Either the user must be signed in already, else need to do the sign-in redirect flow
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length < 1) {
                // Nobody signed in. On browser page load there has been no interaction (e.g. user click event), so have
                // to do the redirect flow, as popups will be blocked.
                // Note: The redirect cause the page to navigate. The Promise never actually resolves, so suppress return type errors.
                return msalInstance.loginRedirect() as any;
            } else {
                // One or more accounts already signed-in. Could prompt the user which to use, but just default to the first
                // It seems rare in a single-tenant app you'd be signed in with multiple accounts at the same time.
                currentUser = currentAccounts[0];
            }
        } else {
            if (!resp.account) throw "AuthenticationResult on redirect had a null account property";
            currentUser = resp.account;
        }

        if (logDetails) console.log(`Logged in as ${currentUser!.username}`);
        return currentUser;
    }).catch(err => {
        // Failed for some reason. Just redirect back to the login site again.
        // Note: The redirect cause the page to navigate. The Promise never actually resolves, so suppress return type errors.
        return msalInstance.loginRedirect() as any;
    });
}

// TODO: If user interaction is required, they may choose a different account. Update currentUser below?
let invokeSignInPopup: ((fn: Function) => void) | null = null;

// Call this to provide the function to run when user interaction is required.
// The UX should invoke the callback when user interaction occurs (e.g. onclick event).
export function setInvokeSignInPopup(fn: (callback: Function) => void) {
    invokeSignInPopup = fn;
}

function authPopupDialog(request: PopupRequest): Promise<AuthenticationResult> {
    if (!invokeSignInPopup) throw "No sign-in popup invoker has been provided";

    var resultPromise = new Promise<AuthenticationResult>((resolve, reject) => {
        invokeSignInPopup!(() => {
            // Inside an onclick handler here, so can call methods that invoke a popup.
            // Resolve the promise this function returns with the result of that call.
            msalInstance.acquireTokenPopup(request).then(resolve, reject);
        });
    });
    return resultPromise;
}

export async function acquireTokenSilentOrPopup(scopes: string[]): Promise<AuthenticationResult> {
    let request = { scopes, account: currentUser!, redirectUri: popupRedirect };

    // Wrap this first block of code in a promise so whatever AuthenticationResult it returns we
    // can access in the resulting .then() callback.
    return Promise.resolve().then(async _ => {
        // First attempt, see if a silent request succeeds.
        try {
            let authResult = await msalInstance.acquireTokenSilent(request);
            return authResult;
        }
        catch (err: any) {
            // If it failed, and not due to user interaction required, then surface that.
            if (!(err instanceof msal.InteractionRequiredAuthError)) {
                if (logDetails) console.log("Unexpected error trying to acquire token silently: %s", err);
                throw err;
            }
        }
        // If user interaction is required, try to show the popup here. This may fail if
        // popups are blocked currently (due to code running NOT as a result of user interaction).
        try {
            let msalResult = await msalInstance.acquireTokenPopup(request);
            if (msalResult && msalResult.accessToken) return msalResult;
        }
        catch (err: any) {
            // BrowserAuthErrorDetected occurs if the popup window was blocked.
            if (!(err instanceof msal.BrowserAuthError)) {
                if (logDetails) console.log("Unexpected error trying to show MSAL popup windows: %s", err);
                throw err;
            }
        }
        // Last try, where we surface some UX for the user to interact with and invoke the popup
        // off of that interaction. Just let the exception bubble up if this fails.
        try {
            let popupResult = await authPopupDialog(request);
            return popupResult;
        }
        catch (err) {
            if (logDetails) console.log("All token acquisition avenues exhausted. Final error: %s", err);
            throw err;
        }
    }).then(authResult => {
        // May have logged in with a different account during interaction. Set new account as current if so.
        if (authResult?.account && authResult.account.homeAccountId != currentUser?.homeAccountId) {
            currentUser = authResult.account;
        }
        return authResult;
    });
}

export function logOut() {
    return msalInstance.logoutRedirect();
}