﻿<template>
  <div>
    <code>{{ weatherData }}</code>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { acquireTokenSilentOrPopup, appScope } from "./auth";

import type { AxiosRequestConfig } from "axios";

const graphScopes = ["User.ReadBasic.All"];

@Component({})
export default class Home extends Vue {
  weatherData = "";

  created() {
    acquireTokenSilentOrPopup([appScope])
      .then((authResult) => {
        let config: AxiosRequestConfig = {
          headers: { Authorization: `Bearer ${authResult.accessToken}` },
        };

        axios.get("/api/WeatherForecast", config)
          .then((resp) =>
            (this.weatherData = resp.data)
          )
          .catch((err) =>
            console.error("Request to weather API failed: %s", err)
          );
      })
      .catch((err) =>
        console.error("acquireToken failed with: %s", err)
      );
  }

  getToken() {
    acquireTokenSilentOrPopup(graphScopes).then((res) => {
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
