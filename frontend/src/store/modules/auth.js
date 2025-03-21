import api from '@/services/api';
import router from '@/router';

export default {
  namespaced: true,
  
  state: {
    token: null,
    user: null
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    token: state => state.token,
    user: state => state.user
  },
  
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
    }
  },
  
  actions: {
    async register({ commit }, credentials) {
     
        const response = await api.post('/register', credentials);
        const { token, user } = response.data;
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        
        router.push('/');
        return response; 
    },
    
    async login({ commit }, credentials) {
        const response = await api.post('/login', credentials);
        const { token, user } = response.data;
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        
        router.push('/');
        return response;
      } 
    },
    
    async logout({ commit }) {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        commit('CLEAR_AUTH');
        router.push('/login');
      }
    },
    
    async updateProfile({ commit }, userData) {
        const response = await api.put('/user', userData);
        commit('SET_USER', response.data);
        return response;
      },
    
    async updatePassword( passwords) {
        const response = await api.put('/user/password', passwords);
        return response;
      },
    
    async deleteAccount({ commit }) {
        await api.delete('/user');
        commit('CLEAR_AUTH');
        router.push('/login');
    }
  }
