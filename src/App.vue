<template>
  <v-app>
    <v-navigation-drawer app clipped permanent>
      <v-list>
        <v-list-item link v-for="i in getRoutes()" :key="i.name" :to="i.path">
          <v-list-item-action>
            <v-icon>{{ i.meta.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-toolbar-title class="sampleClass" @click="showSheet = true"
        >Vuetify Application</v-toolbar-title>
      <v-spacer></v-spacer>
    
      <span>{{userName}}</span>
      <v-btn icon @click="onSignOutClicked">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-bottom-sheet v-model="showSheet" persistent>
      <v-sheet color="indigo" class="text-center" height="200px">
        <div class="pa-4">
          Login expired. Please click "Sign in" to reauthenticate.
        </div>
        <v-btn color="blue" @click="onSignInClicked">Sign in</v-btn>
      </v-sheet>
    </v-bottom-sheet>
  </v-app>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { logOut, setInvokeSignInPopup } from "./auth";

@Component({})
export default class App extends Vue {
  showSheet = false;
  signInClickHandler: Function | null = null;
  userName = "";

  getRoutes() {
    return this.$router.getRoutes().filter((route) => route.path != "*");
  }

  created() {
    // Give the auth handler the function to run when it needs to show UX
    // to respond to user interaction (e.g. a click event to show a popup)
    setInvokeSignInPopup((callback: Function) => {
      this.signInClickHandler = callback;
      this.showSheet = true;
    });
  }

  setUserName(name: string) {
      this.userName = name;
  }

  onSignInClicked() {
    if (this.signInClickHandler) this.signInClickHandler();
    this.signInClickHandler = null;
    this.showSheet = false;
  }

  onSignOutClicked() {
      logOut();
  }
}
</script>

<style>
.myExample {
  font-family: Verdana;
}

.sampleClass {
  color: green;
}
</style>
