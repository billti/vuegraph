<template>
    <v-app id="inspire">
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
            <v-toolbar-title>Vuetify Application</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <v-container class="fill-height" fluid>
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts">
    import { Component, Prop, Watch } from "vue-property-decorator";

    @Component({})
    export default class Layout extends Vue {
        getRoutes() {
            return this.$router.getRoutes().filter(route => route.path != "*");
        }

        created() {
            this.$vuetify.theme.dark = true;
        }
    }
</script>
