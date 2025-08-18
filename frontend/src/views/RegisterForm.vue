<template>
    <p>Hola esto es el registro</p>
    <div>
        <form action="">
            <h2>Register</h2>
            <label for="email"></label>
            <input id="email" name="email" type="email" placeholder="Enter your email"></input>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod'

const userData = ref({ email: "", password: ""})

const userDataSchema = z.object({
    email: z.email({ message: "Invalid email"}).min(1, { message: "Email is required" }),
    password: z.string().min(4, { message: "Password is required" })
})

const errors = ref({ emailError: "", passwordError: "", registerError: "" });

</script>

<style>

</style>