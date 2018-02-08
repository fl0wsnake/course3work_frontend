import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"
import jwtDecode from 'jwt-decode'
import router from './router.js'
import * as r from 'ramda'
import {
  queryParam
} from './utils'
import {
  Socket
} from "phoenix"

Vue.use(Vuex)

let channelBind = (channel, mergeFunc) => (msg, ...middlewares) => channel.on(msg, r.compose(...middlewares, mergeFunc))

// const baseURL = "http://localhost:4000/"
const baseHost = "192.168.0.96:4000"
const baseURL = `http://${baseHost}/`
const redirectUri = () => "https://www.reddit.com/callback/"

// Room: {id, name, owner: {id, name}, users_count, as_master: bool}
// Current_room: {tracks: Track[], participants: User[], owner: User, channel}
// Track: {}

const store = new Vuex.Store({
  state: {
    socket: null,
    error_message: null,
    axios: axios.create({
      baseURL
    }),
    token: null,
    user_id: null,
    user_channel: null,
    spotify_client_id: null,
    rooms: [],
    rooms_in: [],
    room_channel: null,
    current_room: null
  },
  mutations: {
    setToken(state, token) {
      let claims = jwtDecode(token)
      state.token = token
      state.user_id = claims.sub
      state.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return state
    },
    unsetToken(state) {
      state.token = null
      state.user_id = null
      delete state.axios.defaults.headers.common['Authorization']
      return state
    },
    disconnectFromSockets(state) {
      state.user_channel = null
      return state
    },
  },
  actions: {
    async init(ctx, token) {
      ctx.commit("setToken", token)
      await ctx.dispatch("joinUserSocket")
    },
    authCodeForAccessTokens(ctx, authCode) {
      ctx.state.user_channel.push(
        "auth_code_for_access_tokens", {
          code: authCode,
          redirect_uri: redirectUri()
        }
      )
    },
    login(ctx, token) {
      window.localStorage.setItem('token', token)
      ctx.dispatch("init", token)
    },
    unsetUser(ctx) {
      window.localStorage.removeItem("token");
      ctx.commit("unsetToken")
      ctx.commit("disconnectFromSockets")
    },
    logout(ctx) {
      ctx.dispatch("unsetUser")
      $router.push("/login")
    },
    async joinUserSocket(ctx) {
      ctx.state.socket = new Socket(`ws://${baseHost}/socket`, {
        params: {
          token: ctx.state.token
        }
      })
      ctx.state.socket.connect()
      let channel = ctx.state.user_channel = ctx.state.socket
        .channel(`user:${ctx.state.user_id}`, {})
      ctx.state.user_channel
        .join()
        .receive("ok", resp => {
          console.log("Joined successfully", resp)
          ctx.state.user_channel
            .push("directory")
            .receive("ok", data => {
              Object.assign(
                ctx.state,
                r.pick(
                  [
                    "rooms",
                    "rooms_in",
                    "spotify_client_id",
                  ],
                  data
                )
              )
              console.log("ctx.state: ", ctx.state)
              return
            })
        })
        .receive("error", resp => {
          console.log("Unable to join", resp)
          if (resp.reason === "unauthorized") {
            ctx.dispatch("logout")
          }
        })
      // user_channel message handlers
      let on = channelBind(channel, msg => ctx.state = Object.assign({}, ctx.state, msg.state))
      on("room_was_created")
      on("room_was_deleted")
      on("user_was_let_in", msg => ctx.dispatch("joinRoom", msg.room_id))
      on("user_was_not_let_in")
      on("user_was_kicked")
    },
    createRoom(ctx, name) {
      ctx.state.user_channel.push(
        "create_room", {
          name
        }
      ).receive("ok", room => {
        console.log("room created")
        router.push("/directory")
      }).receive("error", err => {
        console.log(err.reason)
        if (err.reason === "no authenticated spotify account") {
          ctx.dispatch("authenticateSpotify")
        }
      })
    },
    knock(ctx, {id: room_id}) {
      return new Promise(
        (resolve, reject) =>
        {
          ctx.state.user_channel
            .push("knock", {room_id})
            .receive("ok", () => {
              resolve()
            })
        }
      )
    },
    joinRoom(ctx, room_id) {
      return new Promise((resolve, reject) => {
        console.log("joining room")
        let channel = ctx.state.socket
          .channel(`room:${room_id}`, {})
        channel
          .join()
          .receive("error", msg => {
            if (msg.reason === "unauthorized") {
              console.log("not authorized to enter this room")
            }
            return 0
          })
          .receive("ok", () => {
            Promise.all(
              [
                new Promise((resolve, reject) => {
                  channel
                    .push("room", {
                      room_id
                    })
                    .receive("ok", msg => {
                      // ctx.state.current_room = Object.assign({}, ctx.state.current_room, msg)
                      resolve(msg)
                    })
                }),
                new Promise((resolve, reject) => {
                  channel
                    .push("tracks")
                    .receive("ok", msg => {
                      // console.log("initial tracks: ", msg)
                      // ctx.state.current_room = Object.assign({}, ctx.state.current_room, msg)
                      // console.log("state with initial tracks: ", ctx.state.current_room)
                      resolve(msg)
                    })
                })
              ]).then(result => {
              ctx.state.current_room = result.reduce((acc, result) => Object.assign(acc, result), {})
              // Vue.set(
              //   ctx.state,
              //   'current_room',
              //   result.reduce(
              //     (acc, result) => Object.assign(acc, result), {}
              //   )
              // )
              console.log(`state fetched: ${JSON.stringify(ctx.state.current_room)}`)
              resolve()
            }).catch(err => {
              console.log(`initial room state fetch failed: ${err}`)
              reject()
            })
          })
        // room_channel message handlers
        let on = channelBind(channel, msg => ctx.state.current_room = Object.assign({}, ctx.state.current_room, msg.state))
        on("user_entered")
        on("user_was_kicked")
        on("added_track")
        on("deleted_track")
        on("liked_track")
        on("unliked_track")
        on("user_was_let_in")
        on("user_was_not_let_in")
        ctx.state.room_channel = channel
      })
    },
    leaveRoom(ctx) {
      ctx.state.room_channel
        .leave()
        .receive("ok", () => {
          console.log("left the room")
          ctx.state.room_channel = null
          ctx.state.current_room = null
        })
    },
    kickUser(ctx, {id: user_id}) {
      ctx.state.room_channel
        .push("kick", {user_id})
    },
    letUserIn(ctx, {id: user_id}) {
      ctx.state.room_channel
        .push("let_user_in", {user_id})
        .receive("error", console.log)
    },
    dismissUser(ctx, user) {
      ctx.state.room_channel
        .push("not_let_user_in", {user_id})
        .receive("error", console.log)
    },
    addTrack(ctx, track_id) {
      ctx.state.room_channel
        .push("add_track", {track_id})
        .receive("error", console.log)
    },
    deleteTrack(ctx, {
      id: track_id
    }) {
      ctx.state.room_channel
        .push("delete_track", {track_id})
        .receive("error", console.log)
    },
    likeTrack(ctx, {id: track_id}) {
      ctx.state.room_channel
        .push("like_track", {track_id})
        .receive("error", console.log)
    },
    unlikeTrack(ctx, {id: track_id}) {
      ctx.state.room_channel
        .push("unlike_track", {
        track_id
      }).receive("error", console.log)
    },
    deleteRoom(ctx, {id: room_id}) {
      ctx.state.room_channel
        .push("delete_room", {room_id}).receive(console.log)
    },
    authenticateSpotify(ctx) {
      window.location.href = `https://accounts.spotify.com/authorize/?client_id=${ctx.state.spotify_client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri())}&scope=${encodeURIComponent("playlist-modify-public")}`
    }
  }
})

export default store
