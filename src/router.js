import Vue from 'vue'
import Router from 'vue-router'
import Directory from './components/Directory'
import Login from './components/Login'
import Register from './components/Register'
import Room from './components/Room'
import CreateRoom from './components/CreateRoom'
import store from './store.js'
import {
    queryParam
} from './utils'

Vue.use(Router)

const router = new Router({
    routes: [{
            path: '/',
            redirect: '/directory'
        },
        {
            path: '/directory',
            component: Directory,
        },
        {
            path: '/room/create',
            component: CreateRoom
        },
        {
            path: '/room/:id',
            component: Room
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/register',
            component: Register
        },
        {
            path: '/callback',
            beforeEnter: (to, from, next) => {
                let authCode = queryParam("code")
                console.log("authcode: " + authCode)
                store.dispatch("authCodeForAccessTokens", authCode)
                window.history.replaceState(null, null, window.location.pathname)
                next("/room/create")
            }
        },
    ],
})

router.beforeEach((to, from, next) => {
    if (!["/login", "/register"].includes(to.path) && !store.state.user_id) {
        let token = window.localStorage.getItem('token')
        if (token) {
            store.dispatch("init", token)
            next()
        } else {
            next({
                path: "/login"
            })
        }
    } else {
        next()
    }
})

export default router
