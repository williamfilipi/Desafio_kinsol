import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import auth from './modules/auth';
import products from './modules/products';

export default createStore({
  modules: {
    auth,
    products
  },
  
  // Persistir estado de autenticação no localStorage
  plugins: [
    createPersistedState({
      key: 'kinsol-product-manager',
      paths: ['auth.token', 'auth.user']
    })
  ]
});