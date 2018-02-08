<template lang="pug">
.ui.grid
    .eight.wide.centered.column
        form.ui.form(@submit.prevent="onSubmit()")
            .field
                label Email
                input(
                    v-model="email",
                    type="text", 
                    name="email", 
                    placeholder="Email"
                )
            .field
                label Password
                input(
                    v-model="password", 
                    type="password", 
                    name="password", 
                    placeholder="Password"
                )
            .row
                button.ui.button(type="password") Submit
                .ui.error.message.visible(v-if='errorMessage') {{errorMessage}}
</template>

<script>
export default {
    data () {
        return {
            email: '',
            password: '',
            errorMessage: '',
        }
    },
    methods: {
        onSubmit() {
            this.$store.state.axios.post('/login', {
                email: this.email,
                password: this.password
            })
                .then(response => {
                    this.$store.dispatch("login", response.data.token)
                    this.$router.push('directory')
                })
                .catch(error => {
                    console.dir(error)
                    this.errorMessage = error.errorMessage || error.message || error.response.data.error.join(' ') || 'Something went wrong.'
                })
        }
    }
}
</script>

<style scoped>
</style>
