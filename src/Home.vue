<template>
    <div>
        <p class="sampleClass">Hello, world</p>
    </div>
</template>

<script lang="ts">
    import { Component } from "vue-property-decorator";

    @Component({})
    export default class Home extends Vue {
    }
</script>

<style>
    .sampleClass {
        color: rebeccapurple;
    }
</style>