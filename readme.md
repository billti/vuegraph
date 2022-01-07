# VueGraph

A simple Vue (and Vuetify) app that authenticates to AzureAD to make calls to ASP.NET REST and Graph APIs.

## How this was authored

Install the Vue libraries with:

  `npm install vue vue-router vuetify`

Install the TypeScript support with:

  `npm install typescript vue-class-component vue-property-decorator`

Install the client side AzureAD and request helper with:

  `npm install @azure/msal-browser axios`

Install the WebPack build tooling with:

  `npm install --save-dev webpack webpack-cli vue-loader vue-template-compiler ts-loader`

Add the below to package.json to build with WebPack via `npm run build`

```
  "scripts": {
    "build": "webpack"
  },
```

Add a `webpack.config.js` file to the root with:

```js
// TODO
```

Add a `tsconfig.json` file with:

```json
// TODO
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