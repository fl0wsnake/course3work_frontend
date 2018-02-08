<template lang="pug">
div
    .ui.inverted.menu
        .ui.left.inverted.menu(v-if="$store.state.user_id")
            router-link.item(to="/directory", active-class="active purple") Directory
            router-link.item(to="/room/create", active-class="active teal") Create room
        .ui.right.inverted.menu
            template(v-if="$store.state.user_id")
                a.item(@click="$store.dispatch('logout')") Logout
            template(v-else)
                router-link.item(to="/login", active-class="active blue") Login
                router-link.item(to="/register", active-class="active violet") Register
    router-view
</template>

<script>
export default {
    data () {
        return {
        }
    },
}
</script>

<style scoped>
</style>
