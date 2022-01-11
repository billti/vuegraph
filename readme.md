# VueGraph

A simple Vue (and Vuetify) starter app that authenticates to AzureAD to make calls to ASP.NET REST
and Microsoft Graph APIs with OAuth2 tokens.

## How it works

This project doesn't bundle external libraries into the `webpack` build. It loads the scripts
directly from the `npm` packages (see the `./Pages/Index.cshtml` file). This results in super fast
build times for `webpack`, smaller bundles to download from the server, and better cache usage on
the client (as when the app bundle is rebuilt, the cached libraries from the CDN don't need to be
reloaded).

Loading scripts means globals such as `Vue`, `Vuetify`, `msal`, and `axios` are implicitly in scope
and don't need to be imported. See the `shims.d.ts` file for how this is set up for TypeScript.

When running in `Production` mode, the total download for the app is under 800kb, with only around
80kb (unminified) being loaded from the host server, and the rest being 3rd party packages loaded
from the CDN.

`Webpack` builds times are around 4 seconds from cold (on my laptop), and around 250ms when building
changes in `--watch` mode.

## Auth flows

As written, this app expects a user to have logged in with AzureAD. On site load if there is no
active account then it will redirect the user to the sign-in page at `login.microsoftonline.com`
(see `requireAccount` call in `./src/main.ts`).

Once a user is signed in, further token acquisition may be attempted silently. Occasionally this
can fail if tokens have expired or user consent is needed for additional permissions. Ideally this
would show a popup to the user, however this can be problematic as the network response is
asynchronous, and popups are blocked by browsers unless the result of direct user interaction (e.g.
by a click on the page). Doing a redirect is undesirable, as the page may contain unsaved changes or
other state that could be lost on performing the redirect flow.

The solution to this here is to use a modal overlay on the app on token failure due to the need for
user interaction, which the user must click on to acknowledge, which then triggers the popup flow to
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

(The actual code is a little more complex. See `aquireTokenSilentOrPopup` in `./src/auth.ts`)

Note: Be sure to register the popup redirect URL `/popupRedirect.html` as a reply URL for the app,
as well as the root of the origin (e.g. `https://example.com/`). This demo also requires an
'access_as_user' scope be registered for the app. See the start of `./src/auth.ts`.

## How this was authored

Install the Vue libraries with:

  `npm install vue vue-router vuetify`

Install the client side AzureAD and REST request helper with:

  `npm install @azure/msal-browser axios`

Install the TypeScript support with:

  `npm install --save-dev typescript vue-class-component vue-property-decorator`

Install the webpack build tooling with:

  `npm install --save-dev webpack webpack-cli vue-loader vue-template-compiler ts-loader mini-css-extract-plugin`

Add a `webpack.config.js` file as per this project for Vue, TypeScript, and CSS build support.

Likewise see the `tsconfig.json` at the root of this project for the minimal settings needed.

Add the below to package.json to build with webpack via `npm run build`

```txt
  "scripts": {
    "build": "webpack",
    "build:watch": "webpack --watch"
  },
```

Add `<TypeScriptCompileBlocked>true</TypeScriptCompileBlocked>` to the .csproj file to only compile
the TypeScript code via webpack, not Visual Studio.

## Links

The below links may be useful for more information:

- The docs at <https://github.com/microsoft/typescript-vue-starter> give a lot good info.
- See also <https://vue-loader.vuejs.org/guide/#manual-setup> for vue-loader details.
- Vue and TypeScript setup explained with examples at <https://johnpapa.net/vue-typescript/>
- WebPack TypeScript docs at <https://webpack.js.org/guides/typescript/>
- Using Class Components <https://class-component.vuejs.org/>
- Property decorators <https://github.com/kaorun343/vue-property-decorator>
- Vue TypeScript support <https://vuejs.org/v2/guide/typescript.html>
- MSAL usage docs at <https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser>

## TODO

- Add an authenticated REST API on the controllers
- Add the Account page
- Add the ability to search Graph for users
- Detail setting the user secret via `dotnet user-secrets set "AzureAd:ClientSecret" "bc5412...."`
  - This may not be required if the API is just validating the token (and not request or exchanging tokens).
