<template lang="pug">
div(v-if="$store.state.current_room")
    h3.ui.header Knocked users:
    .ui.relaxed.divided.list(v-if="$store.state.current_room.knocked_users.length")
        .item(v-for="user in $store.state.current_room.knocked_users")
            .content
                .header {{user.username}}
                .ui.mini.green.outline.button(@click="$store.dispatch('letUserIn', user)") Let in
                .ui.mini.red.outline.button(@click="$store.dispatch('dismissUser', user)") Dismiss
</template>

<script>
export default {
    data () {
        return {
        }
    },
    computed: {
        isOwner () {
            return this.$store.state.current_room.owner.id == this.$store.state.user_id
        },
    },
    methods: {
    }
}
</script>

<style scoped>
</style>
