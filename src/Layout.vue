<template>
    <v-app>
        <v-navigation-drawer app clipped>
            <v-list>
                <v-list-item link v-for="i in getRoutes()" :key="i.name" :to="i.path">
                    <v-list-item-action>
                        <v-icon>{{i.meta.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{i.name}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app clipped-left>
            <v-toolbar-title class="sampleClass" @click="showSheet = true">Vuetify Application</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
        </v-main>

        <v-bottom-sheet v-model="showSheet" persistent>
            <v-sheet color="indigo" class="text-center" height="200px">
                <div class="pa-4">Login expired. Please click "Sign in" to reauthenticate.</div>
                <v-btn color="blue" @click="onSignInClicked">Sign in</v-btn>
            </v-sheet>
        </v-bottom-sheet>
    </v-app>
</template>

<script lang="ts">
    import { Component, Prop, Watch } from "vue-property-decorator";
    import {loginPopup} from "./auth";

    @Component({})
    export default class Layout extends Vue {
        showSheet = false;

        getRoutes() {
            return this.$router.getRoutes().filter(route => route.path != "*");
        }

        onSignInClicked() {
            loginPopup(["openid", "User.Read"]).then(res => {
                console.log("Authenticated as user: %s", res.account?.username);
            }).finally(() => this.showSheet = false);
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
