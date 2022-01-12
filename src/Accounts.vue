<template>
  <v-container class="fc-page-container pt-5 pl-5 pr-3">
    <v-toolbar class="mt-n3">
      <v-toolbar-title>Permissions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="ma-5" v-on:click="addUserClicked" v-if="isOrgSelected" >Add User</v-btn >
      <v-btn class="ma-5" v-on:click="saveClicked" :disabled="!isDirty" >Save</v-btn >
    </v-toolbar>
    <div style="display: flex; height: 100vh; max-height: calc(100% - 240px)" >
      <div style="min-width: 300px; overflow-y: auto; margin-right: 20px">
        <v-treeview :active.sync="active" :items="items" activatable color="warning" open-all transition >
          <template v-slot:prepend="{ item }">
            <v-icon v-if="!item.children"> mdi-account </v-icon>
          </template>
        </v-treeview>
      </div>
      <div style="min-width: 340px" v-if="selected">
        <v-card class="pa-2 text-center permWidth">
          <v-scroll-y-transition mode="out-in">
            <div v-if="!selected" class="text-h6 grey--text text--lighten-1 font-weight-light" style="align-self: center" >
              Select a User
            </div>
            <v-card v-else :key="selected.id" flat max-width="400">
              <v-card-text>
                <v-avatar size="100">
                  <v-img :src="avatar"></v-img>
                </v-avatar>
                <h3 class="text-h5 mb-2">
                  {{ selected.name }}
                </h3>
                <div class="blue--text mb-2">
                  {{ selected.email }}
                </div>
                <div class="blue--text subheading font-weight-bold">
                  {{ selected.alias }}
                </div>
              </v-card-text>
            </v-card>
          </v-scroll-y-transition>
        </v-card>
      </div>
      <div style="min-width: 275px; overflow-y: auto; margin-left: 40px" v-if="selected" >
        <h3>Access Rights</h3>
        <v-treeview selectable :items="itemPermissions" :open="open" v-model="permissionSelection" ></v-treeview>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import { exampleDocument, GetProfilePic, SearchUsers } from "./users";

type treeViewItem = {
    id: number;
    name: string;
    locked?: boolean;
    children?: treeViewItem[];
    [misc: string]: any;
}

@Component({})
export default class UserPermissions extends Vue {
  active = [];
  avatar: string | null = null;
  open: number[] = [];
  users: treeViewItem[] = [];
  userPermissions: treeViewItem[] = [];

  permissionSelection = [1, 7, 9, 15];
  dirtyState = false;
  isAuthenticated = false;

  get items(): any {
    return this.users;
  }

  get itemPermissions(): any {
    return this.userPermissions;
  }

  get selected(): any {
    this.avatar = null;
    if (!(this as any).active.length) return undefined;

    const id = (this as any).active[0];

    var foundUser: any = undefined;

    this.users.forEach((org) =>
      org.children?.forEach((user) => {
        if (user.id === id) foundUser = user;
      })
    );

    if (foundUser) {
      let oid = foundUser.accountId.split(".")[1];
        GetProfilePic(oid).then((pic) => {
        this.avatar = pic;
      });
      this.permissionsForUser(foundUser.accountId);
    }

    return foundUser;
  }

  get isDirty() {
    return this.dirtyState;
  }

  get isOrgSelected() {
    if (!(this as any).active.length) return undefined;

    const id = (this as any).active[0];

    // If it's a top-level node, it's an org
    return this.users.some(node => node.id === id);
  }

  mounted() {
      this.usersToTreeView();
  }

  @Watch("permissionSelection")
  permsChanged() {
    this.dirtyState = true;
  }

  addUserClicked(): any {
      debugger;
    SearchUsers("Ariana").then(result => {
        console.log(result);
    }).catch(err => console.error(err));
  }

  saveClicked() {
    this.dirtyState = false;
  }

  usersToTreeView() {
      // Get the list of users and construct the company and permissions tree views.
      let userTree: treeViewItem[] = [];

      let serverResponse = exampleDocument; // TODO: Get from the service.
      let currId = 1;

      // Add each org as a root to the tree
      serverResponse.orgs.forEach(org => {
          userTree.push({id: currId++, name: org, children: []});
      });

      Object.getOwnPropertyNames(serverResponse.users).forEach(accountId => {
          let currUser = serverResponse.users[accountId];
          let orgNode = userTree.find(node => node.name === currUser.org);
          if (!orgNode) throw `User ${currUser.displayName} has an invalid org`;
          orgNode.children!.push({id: currId++, name: currUser.displayName, accountId});
      });

      this.users = userTree;
  }

  permissionsForUser(accountId: string) {
      // Construct a tree with root nodes for "Global" plus every org, and a subnode for every permission.
      let permissions: treeViewItem[] = [];
      let enabled: number[] = [];
      let openOrgs: number[] = [];
      let currId = 0;

      let availablePermissions = ["Admin", "Reader", "Reviewer", "Creator", "Publisher"];

      let serverResponse = exampleDocument; // TODO: Get from the service.
      let topLevelNodes = ["Global", ...serverResponse.orgs];
      let user = serverResponse.users[accountId];
      if (!user) throw `User ${accountId} was selected but not found`;

      // Build the tree for each org and permission.
      topLevelNodes.forEach(org => {
          let orgNode: treeViewItem = {id: ++currId, name: org, children: []};
          availablePermissions.forEach(perm => {
              let aclName = `${org}:${perm}`
              orgNode.children!.push({id: ++currId, name: perm, aclName});

              // If the user has this permission, then enable it in the tree
              if (user.acl.includes(aclName)) {
                  enabled.push(currId);
                  if (!openOrgs.includes(orgNode.id)) openOrgs.push(orgNode.id);
              }
          });
          permissions.push(orgNode);
      });

      this.open = openOrgs;
      this.userPermissions = permissions;
      this.permissionSelection = enabled;
  }
}
</script>

<style scoped>
.sampleClass {
  color: rebeccapurple;
}
</style>
