<template lang="pug">
.ui.grid
    .eight.wide.centered.column
        form.ui.form(@submit.prevent="onSubmit()")
            .field
                label Username
                    input(v-model="username"
                    type="text"
                    placeholder="Username")
                .field
                    label Email
                    input(v-model="email"
                    type="text"
                    placeholder="Email")
                .field
                    label Password
                    input(v-model="password"
                    type="password"
                    placeholder="Password")
                .field
                    label Repeat password
                    input(v-model="repeatPassword"
                    type="password"
                    placeholder="Repeat password")
                button.ui.button(type="submit") Submit
                .ui.error.message.visible(v-if='errorMessage') {{errorMessage}}
</template>

<script>
export default {
    data () {
        return {
            username: '',
            email: '',
            password: '',
            repeatPassword: '',
            errorMessage: '',
        }
    },
    computed: {
        passwordsMatch() {
            return this.password === this.repeatPassword
        }
    },
    methods: {
        onSubmit() {
            if (!this.passwordsMatch) {
                this.errorMessage = "passwords don't match"
            } else {
                this.$store.state.axios.post("/register", {
                    username: this.username,
                    email: this.email,
                    password: this.password
                })
                    .then(response => {
                        this.$store.dispatch("login", response.data.token)
                        this.$router.push("directory")
                    })
                    .catch(error => {
                        this.errorMessage = error.errorMessage || error.response.data.error.join(' ') || 'Something went wrong.'
                    })
            }
        }
    }
}
</script>

<style scoped>
</style>
