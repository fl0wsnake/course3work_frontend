<template lang="pug">
div(v-if="$store.state.current_room")
    h3.ui.header Participants:
    .ui.relaxed.divided.list(v-if="$store.state.current_room.participants.length")
        .item(v-for="user in $store.state.current_room.participants")
            .content
                .header(@click="$store.dispatch('kickUser', user)") {{user.username}}
</template>

<script>
export default {
    data () {
        return {
        }
    },
    computed: {
    },
    methods: {
    }
}
</script>

<style scoped>
</style>
