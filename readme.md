# VueGraph

A simple Vue (and Vuetify) starter app that authenticates to AzureAD to make calls to ASP.NET REST
and Microsoft Graph APIs with OAuth2 tokens.

## How it works

This project doesn't bundle external libraries into the WebPack build. It loads the scripts directly
from the NPM packages (see the Index.cshtml file). This results in super fast build times for
WebPack, smaller bundles to download from the server, and better cache usage on the client.

Loading scripts means globals such as `Vue`, `Vuetify`, `msal`, and `axios` are implicitly in scope
and don't need to be imported. See the `shims.d.ts` file for how this is set up for TypeScript.

When running in `Production` mode, the total download for the app is under 800KB, with only around
80KB being loaded from the host server, and the rest being 3rd party packages loaded from the CDN.

## Auth flows

As written, this app expects a user to have logged in with AzureAD. On site load if there is no
active account then it will redirect the user to the sign-in page at login.microsoftonline.com (see
`requireAccount` call in `main.ts`).

Once a user is signed in, further token acquisition may be attempted silently. Occasionally this
can fail if tokens have expired or user consent is needed for additional permissions. Ideally this
would show a popup to the user, however this can be problematic as the network response is
asynchronous, and popups are blocked by browsers unless the result of direct user interaction (e.g.
a click on the page). Doing a redirect is undesirable, as the page may contain unsaved changes or
other state that could be lost on peforming the redirect flow.

The solution to this here is to use a model overlay on token failure due to the need for user
interaction, which the user must click on to acknowledge, which then triggers the popup flow to
authenticate with AzureAD. In pseudo-code this is something like:

```ts
async function acquireToken(scopes: string[]) : Promise<Token> {
  try {
    let authResult = await msal.acquireTokenSilent(scopes);
    return authResult.Token;
  }
  catch (err) {
    if (err.name !== "InteractionRequired") throw err;

    let clickHandler = () => msal.acquireTokenPopup(scopes);

    // The below will run the click handler synchronously as a result of the
    // "Sign in" button in the auth modal dialog being clicked.
    let popupResult = await authPopupDialog(clickHandler);
    return popupResult.Token;
  }
}
```

Note: Be sure to register the popup redirect URL `/popupRedirect.html` as a reply URL for the app.

## How this was authored

Install the Vue libraries with:

  `npm install vue vue-router vuetify`

Install the TypeScript support with:

  `npm install typescript vue-class-component vue-property-decorator`

Install the client side AzureAD and REST request helper with:

  `npm install @azure/msal-browser axios`

Install the WebPack build tooling with:

  `npm install --save-dev webpack webpack-cli vue-loader vue-template-compiler ts-loader mini-css-extract-plugin`

Add the below to package.json to build with WebPack via `npm run build`

```
  "scripts": {
    "build": "webpack"
  },
```

Add a `webpack.config.js` file to the root with:

```js
// TODO: Detail the needed config
```

Add a `tsconfig.json` file with:

```json
// TODO: Detail the needed config
```

Add the following property to the .csproj file: `<TypeScriptCompileBlocked>true</TypeScriptCompileBlocked>`

## Links

The docs at <https://github.com/microsoft/typescript-vue-starter> give a lot good info.
See also <https://vue-loader.vuejs.org/guide/#manual-setup> for vue-loader details.
Vue and TypeScript setup explained with examples at <https://johnpapa.net/vue-typescript/>
WebPack TypeScript docs at <https://webpack.js.org/guides/typescript/>
Using Class Components <https://class-component.vuejs.org/>
Property decorators <https://github.com/kaorun343/vue-property-decorator>
Vue TypeScript support <https://vuejs.org/v2/guide/typescript.html>
MSAL usage docs at <https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser>

## TODO

- Add the Account page
- Add the ability to search Graph for users
- Add an authenticated REST API on the controllers
