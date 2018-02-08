<template lang="pug">
.ui.grid
    .four.wide.centered.column
        participants
    .eight.wide.centered.column
        div(v-if="$store.state.current_room")
            h3.ui.header 
            .content room: {{$store.state.current_room.name}}, owner: {{$store.state.current_room.owner.username}}
            .right.floated.content(v-if="isOwner") 
                button(@click="")
            .ui.fluid.input
                input(v-model="searchTerm", @focusout="searchTerm = ''", type="text", placeholder="Search for track...")
            .ui.fluid.vertical.menu(v-if="matchedTracks.length")
                a.item(v-for="matchedTrack in matchedTracks", @mousedown="$store.dispatch('addTrack', matchedTrack.id)") {{matchedTrack.name}} by {{matchedTrack.artist}}
            .ui.middle.aligned.divided.list
                .item(v-for="track in tracks")
                    .right.floated.content
                        .ui.icon.basic.button(
                        @click="$store.dispatch('deleteTrack', track)",
                        v-if="isOwner"
                        )
                            i.trash.outline.icon
                        .ui.labeled.icon.basic.button(
                        v-if="track.liked",
                        @click="$store.dispatch('unlikeTrack', track)"
                        )
                            i.thumbs.up.icon
                            | {{track.rating}}
                        .ui.labeled.icon.basic.button(
                        v-else,
                        @click="$store.dispatch('likeTrack', track)"
                        )
                            i.thumbs.outline.up.icon
                            | {{track.rating}}
                    .content
                        .header {{track.name}}
                        .description by {{track.artists.join(", ")}}
    .four.wide.centered.column
        knocked-users
</template>

<script>
import * as r from 'ramda'
import Participants from "./Participants.vue"
import KnockedUsers from "./KnockedUsers.vue"
export default {
    components: {
        "participants": Participants,
        "knocked-users": KnockedUsers,
    },
    data () {
        return {
            searchTerm: "",
            matchedTracks: [],
            timeoutId: 0
        }
    },
    computed: {
        isOwner () {
            return this.$store.state.current_room.owner.id == this.$store.state.user_id
        },
        tracks () {
            if (this.$store.state.current_room) {
                return r.sort(r.descend(r.prop("rating")), this.$store.state.current_room.tracks.map(
                    track =>
                    r.assoc(
                        "artists",
                        track.artists.map(artist => artist.name),
                        r.pick(
                            ["id", "name", "rating", "liked"],
                            track
                        ),
                    )
                ))
            } else {
                return []
            }
        }
    },
    watch: {
        searchTerm(query) {
            if (query.length < 3) {
                this.matchedTracks = []
            } else {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    this.$store.state.room_channel
                        .push("search", {query})
                        .receive("ok", msg => {
                            this.matchedTracks = msg.tracks.items.map(item => ({
                                id: item.id,
                                name: item.name,
                                artist: item.artists[0].name,
                            }))
                        })
                }, 500)
            }
        }
    },
    methods: {
        deleteTrack(track) {
            this.$store.dispatch("deleteTrack", track.id)
        }
    },
    mounted(){
        if (!this.$store.current_room) {
            this.$store.dispatch("joinRoom", this.$route.params.id).catch(err => {
                this.$router.push("/directory")
            })
        }
    },
    beforeDestroy(to, from, next){
        this.$store.dispatch("leaveRoom")
    },
}
</script>

<style scoped>
</style>
