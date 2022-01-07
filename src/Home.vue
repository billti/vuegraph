<template>
  <div>
    <p class="sampleClass" @click="getToken">Click me for a token</p>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { acquireToken } from "./auth";

const graphScopes = [
  "User.ReadBasic.All",
  "User.Read",
];

@Component({})
export default class Home extends Vue {
  getToken() {
    acquireToken(graphScopes).then((res) => {
      console.log( "Got scopes [%s] for user: %s", res.scopes.join(","), res.account?.name);
    });
  }
}
</script>

<style scoped>
.sampleClass {
  color: rebeccapurple;
}
</style>
