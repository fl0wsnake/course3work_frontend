<template lang="pug">
.ui.relaxed.divided.list
    h3.ui.header(v-if="$store.state.rooms.length") Rooms:
    h3.ui.header(v-else) No rooms yet.
    <!-- .item(v-for="room in rooms", :class="{'in-room': room.is_user_in, 'have-not-knocked': !room.knocked, 'have-knocked': !room.knocked}") -->
    .item(v-for="room in rooms")
        .content
            .header(@click="joinRoom(room)") {{room.name}}
                .description Owner: {{room.owner.username}}, {{room.users_count}} users{{room.as_master ? ", as master":""}}{{room.knocked ? ", knocked" : ""}}
        <!-- .right.floated.content -->
            <!-- .ui.mini.button(v-if="!room.is_user_in", :class="{disabled: room.knocked}") {{ room.knocked ? "Already knocked" : "Knock" }} -->
            <!-- i.warning.icon(v-if="room.knocked") -->
</template>

<script>
export default {
    data () {
        return {
        }
    },
    computed: {
        rooms() {
            return this.$store.state.rooms.map(
                room => 
                {
                    room.is_owner = room.owner.id === this.$store.state.user_id
                    room.is_user_in = !!this.$store.state.rooms_in
                        .find(room_in => room_in.id === room.id)
                    console.log("room.is_user_in = ", this.$store.state.rooms_in, room.id)
                    return room
                }
            )
        }
    },
    methods: {
        joinRoom(room){
            if (room.is_user_in) {
                console.log("joining...")
                this.$store.dispatch('joinRoom', room.id).then(err => {
                    console.log("joined")
                    this.$router.push(`/room/${room.id}`)
                })
            } else {
                console.log("knocking...")
                this.$store.dispatch('knock', room).then(() => {
                    console.log("knocked")
                    room.knocked = true
                })
            }
        }
    }
}
</script>

<style scoped>
/* .in-room {
    background-color: rgb(217, 231, 120)
}
.have-not-knocked {
    background-color: rgb(217, 231, 120)
}
.have-knocked {
    background-color: rgb(217, 231, 120)
} */
</style>
