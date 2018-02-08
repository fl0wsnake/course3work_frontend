<template lang="pug">
.ui.relaxed.divided.list
    h3.ui.header Participating in room:
    .item(v-for="room in $store.state.rooms_in")
        .content
            .header(@click="joinRoom(room)") {{room.name}}
                .description Owner: {{room.owner.username}}, {{room.users_count}} users{{room.as_master?", as master":""}}
        <!-- .right.floated.content -->
            <!-- .ui.mini.button(v-if="!room.is_user_in", :class="{disabled: room.knocked}") {{ room.knocked ? "Already knocked" : "Knock" }} -->
            <!-- i.warning.icon(v-if="room.knocked") -->
</template>

<script>
export default {
    props: ["roomsProp"],
    data () {
        return {
        }
    },
    computed: {
        rooms() {
            return this.roomsProp.map(
                room => 
                {
                    room.is_owner = this.$store.state.current_room.owner.id === this.$store.state.user_id
                    return room
                }
            )
        }
    },
    methods: {
        joinRoom(room){
            this.$store.dispatch('joinRoom', room.id).then(err => {
                this.$router.push(`/room/${room.id}`)
            })
        }
    }
}
</script>

<style scoped>
.in-room {
    background-color: rgb(217, 231, 120)
}
.have-not-knocked {
    background-color: rgb(217, 231, 120)
}
.have-knocked {
    background-color: rgb(217, 231, 120)
}
</style>
