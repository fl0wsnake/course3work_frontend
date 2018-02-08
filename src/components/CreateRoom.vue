<template lang="pug">
.ui.grid
    .four.wide.centered.column
        participating-in-rooms
    .twelve.wide.centered.column
        form.ui.form(@submit.prevent="onSubmit()")
            .field
                label Room name
                input(
                    v-model="roomName",
                    type="text", 
                    placeholder="Room name"
                )
            button.ui.button(type="submit") Create room
</template>

<script>
import ParticipatingInRooms from "./ParticipatingInRooms.vue"

export default {
    components: {
        "participating-in-rooms": ParticipatingInRooms,
    },
    data () {
        return {
            roomName: ''
        }
    }, 
    methods: {
        onSubmit() {
            this.$store.dispatch("createRoom", this.roomName)
        }
    }
}
</script>

<style scoped>
</style>
