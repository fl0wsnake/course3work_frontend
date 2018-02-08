<template lang="pug">
.ui.grid
    .four.wide.centered.column
        participating-in-rooms
    .twelve.wide.centered.column
        room-list(:roomsProp="$store.state.rooms")
</template>

<script>
import ParticipatingInRooms from "./ParticipatingInRooms.vue"
import RoomList from "./RoomList.vue"

export default {
    components: {
        "participating-in-rooms": ParticipatingInRooms,
        "room-list": RoomList
    },
    data () {
        return {
        }
    },
}
</script>

<style scoped>
</style>
