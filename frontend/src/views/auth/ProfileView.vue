<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1 class="title">Meu Perfil</h1>
      
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="name">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="profileForm.name" 
            class="form-control" 
            :class="{ 'is-invalid': errors.name }"
            required
          >
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>
        
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            v-model="profileForm.email" 
            class="form-control" 
            disabled
          >
          <small class="form-text text-muted">O e-mail não pode ser alterado.</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
      
      <hr class="divider">
      
      <h2 class="subtitle">Alterar Senha</h2>
      
      <form @submit.prevent="updatePassword">
        <div class="form-group">
          <label for="current_password">Senha Atual</label>
          <input 
            type="password" 
            id="current_password" 
            v-model="passwordForm.current_password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.current_password }"
            required
          >
          <div v-if="errors.current_password" class="error-message">{{ errors.current_password }}</div>
        </div>
        
        <div class="form-group">
          <label for="new_password">Nova Senha</label>
          <input 
            type="password" 
            id="new_password" 
            v-model="passwordForm.new_password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.new_password }"
            required
          >
          <div v-if="errors.new_password" class="error-message">{{ errors.new_password }}</div>
        </div>
        
        <div class="form-group">
          <label for="new_password_confirmation">Confirmar Nova Senha</label>
          <input 
            type="password" 
            id="new_password_confirmation" 
            v-model="passwordForm.new_password_confirmation" 
            class="form-control"
            required
          >
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isPasswordLoading">
            {{ isPasswordLoading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </form>
      
      <hr class="divider">
      
      <div class="delete-account">
        <h2 class="subtitle">Excluir Conta</h2>
        <p class="warning-text">Atenção: Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
        <button @click="confirmDeleteAccount" class="btn btn-danger">Excluir Minha Conta</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'UserProfile',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const isLoading = ref(false);
    const isPasswordLoading = ref(false);
    const errors = reactive({});
    const successMessage = ref('');
    const errorMessage = ref('');
    
    const user = computed(() => store.getters['auth/user']);
    
    const profileForm = reactive({
      name: '',
      email: ''
    });
    
    const passwordForm = reactive({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
    
    onMounted(() => {
      // Preenche o formulário com os dados do usuário logado
      if (user.value) {
        profileForm.name = user.value.name;
        profileForm.email = user.value.email;
      }
    });
    
    const updateProfile = async () => {
      clearMessages();
      clearErrors();
      
      if (!profileForm.name) {
        errors.name = 'O nome é obrigatório';
        return;
      }
      
      isLoading.value = true;
      
      try {
        await store.dispatch('auth/updateProfile', {
          name: profileForm.name
        });
        
        successMessage.value = 'Perfil atualizado com sucesso!';
      } catch (error) {
        console.error('Update profile error:', error);
        handleApiErrors(error);
        errorMessage.value = 'Ocorreu um erro ao atualizar o perfil.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const updatePassword = async () => {
      clearMessages();
      clearErrors();
      
      // Validação
      if (!passwordForm.current_password) {
        errors.current_password = 'A senha atual é obrigatória';
      }
      
      if (!passwordForm.new_password) {
        errors.new_password = 'A nova senha é obrigatória';
      }
      
      if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
        errors.new_password = 'As senhas não conferem';
      }
      
      if (Object.keys(errors).length > 0) return;
      
      isPasswordLoading.value = true;
      
      try {
        await store.dispatch('auth/updatePassword', {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
          new_password_confirmation: passwordForm.new_password_confirmation
        });
        
        // Limpa o formulário de senha
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordForm.new_password_confirmation = '';
        
        successMessage.value = 'Senha alterada com sucesso!';
      } catch (error) {
        console.error('Update password error:', error);
        handleApiErrors(error);
        errorMessage.value = 'Ocorreu um erro ao alterar a senha.';
      } finally {
        isPasswordLoading.value = false;
      }
    };
    
    const confirmDeleteAccount = () => {
      if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        deleteAccount();
      }
    };
    
    const deleteAccount = async () => {
      try {
        await store.dispatch('auth/deleteAccount');
        router.push('/login');
      } catch (error) {
        console.error('Delete account error:', error);
        errorMessage.value = 'Ocorreu um erro ao excluir a conta.';
      }
    };
    
    const clearMessages = () => {
      successMessage.value = '';
      errorMessage.value = '';
    };
    
    const clearErrors = () => {
      Object.keys(errors).forEach(key => delete errors[key]);
    };
    
    const handleApiErrors = (error) => {
      if (error.response && error.response.data && error.response.data.errors) {
        Object.assign(errors, error.response.data.errors);
      }
    };
    
    return {
      user,
      profileForm,
      passwordForm,
      errors,
      isLoading,
      isPasswordLoading,
      successMessage,
      errorMessage,
      updateProfile,
      updatePassword,
      confirmDeleteAccount
    };
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.profile-card {
  width: 100%;
  max-width: 600px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.subtitle {
  margin-bottom: 16px;
  font-size: 20px;
  color: #333;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
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

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 14px;
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
  display: inline-block;
  padding: 10px 20px;
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
  width: 100%;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #eee;
}

.delete-account {
  margin-top: 20px;
}

.warning-text {
  color: #dc3545;
  margin-bottom: 16px;
}
</style>