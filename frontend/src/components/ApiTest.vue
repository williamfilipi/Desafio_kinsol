<template>
    <div>
      <h2>Testando API Laravel</h2>
      <button @click="fetchData">Fazer Requisição</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>

<script>
import api from '@/services/api';

export default {
  data() {
    return {
      message: '',
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await api.get('/teste');
        this.message = response.data.message;
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        this.message = 'Erro ao buscar os dados!';
      }
    },
  },
};
</script>
  