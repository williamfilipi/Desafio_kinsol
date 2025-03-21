<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="title">Login</h1>
      
      <div v-if="errors.general" class="alert alert-danger">
        {{ errors.general }}
      </div>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            class="form-control" 
            :class="{ 'is-invalid': errors.email }"
            required
          >
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.password }"
            required
          >
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
        
        <div class="auth-links">
          Não tem uma conta? <router-link to="/register">Registre-se</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginView',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const isLoading = ref(false);
    const errors = reactive({});
    
    const form = reactive({
      email: '',
      password: ''
    });
    
    const submitForm = async () => {
      // Limpar erros anteriores
      Object.keys(errors).forEach(key => delete errors[key]);
      
      // Validação básica
      if (!form.email) errors.email = 'O e-mail é obrigatório';
      if (!form.password) errors.password = 'A senha é obrigatória';
      
      // Se houver erros, não continua
      if (Object.keys(errors).length > 0) return;
      
      isLoading.value = true;
      
      try {
        await store.dispatch('auth/login', {
          email: form.email,
          password: form.password
        });
        
        // Redirecionar após login bem-sucedido
        router.push('/');
      } catch (error) {
        console.error('Login error:', error);
        
        // Processar erros da API
        if (error.response && error.response.data && error.response.data.errors) {
          Object.assign(errors, error.response.data.errors);
        } else {
          errors.general = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      form,
      errors,
      isLoading,
      submitForm
    };
  }
};
</script>

<style scoped>
/* Estilos iguais ao componente Register */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
  color: #333;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  margin-top: 24px;
}

.btn {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
}

.auth-links a {
  color: #4CAF50;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>