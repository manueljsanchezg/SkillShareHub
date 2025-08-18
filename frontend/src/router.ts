import { createRouter, createWebHistory } from 'vue-router'
import LogInForm from './views/LogInForm.vue'
import RegisterForm from './views/RegisterForm.vue'

const routes = [
  { path: '/sign-in', component: LogInForm, meta: { public: true } },
  { path: '/sign-up', component: RegisterForm, meta: { public: true } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})