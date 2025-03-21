<template>
  <div id="app">
    <!-- Links de navegação -->
    <nav>
      <rounter-link to="/login" alt="Login"></rounter-link>
      <rounter-link to="/register" alt="Registro"></rounter-link>

      <router-view />
      <ApiTest />
    </nav>
  </div>

</template>

<script>
  import ApiTest from './components/ApiTest.vue';

  export default {
    components: {
      ApiTest,
    },
  };
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
