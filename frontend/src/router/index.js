import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ProductListView from '../views/products/ProductListView.vue'
import UserProfileView from '../views/auth/ProfileView.vue'
import ProductFormView from '../views/products/ProductFormView.vue'

const routes = [
  {
    path: '/',
    redirect: '/register' // Redireiona para tela de registro
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/products',
    name: 'products',
    component: ProductListView
  },
  {
    path: '/products/new',
    name: 'product-new',
    component: ProductFormView
  },
  {
    path: '/products/:id/edit',
    name: 'product-edit',
    component: ProductFormView,
    props: true
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router