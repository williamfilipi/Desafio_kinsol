<template>
    <div class="product-form-container">
      <div class="form-card">
        <h1 class="title">{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h1>
        
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form @submit.prevent="saveProduct">
          <div class="form-group">
            <label for="name">Nome *</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              class="form-control" 
              :class="{ 'is-invalid': errors.name }"
              required
            >
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>
          
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea 
              id="description" 
              v-model="form.description" 
              class="form-control" 
              :class="{ 'is-invalid': errors.description }"
              rows="4"
            ></textarea>
            <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
          </div>
          
          <div class="form-group">
            <label for="category_id">Categoria</label>
            <select 
              id="category_id" 
              v-model="form.category_id" 
              class="form-control" 
              :class="{ 'is-invalid': errors.category_id }"
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <div v-if="errors.category_id" class="error-message">{{ errors.category_id }}</div>
          </div>
          
          <div class="price-inputs">
            <div class="form-group">
              <label for="purchase_price">Preço de Compra *</label>
              <div class="input-group">
                <span class="input-prefix">R$</span>
                <input 
                  type="number" 
                  id="purchase_price" 
                  v-model="form.purchase_price" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.purchase_price }"
                  step="0.01" 
                  min="0" 
                  required
                >
              </div>
              <div v-if="errors.purchase_price" class="error-message">{{ errors.purchase_price }}</div>
            </div>
            
            <div class="form-group">
              <label for="sale_price">Preço de Venda *</label>
              <div class="input-group">
                <span class="input-prefix">R$</span>
                <input 
                  type="number" 
                  id="sale_price" 
                  v-model="form.sale_price" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.sale_price }"
                  step="0.01" 
                  min="0" 
                  required
                >
              </div>
              <div v-if="errors.sale_price" class="error-message">{{ errors.sale_price }}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="image">Imagem</label>
            <input 
              type="file" 
              id="image" 
              ref="imageInput"
              @change="handleImageChange" 
              class="form-control-file" 
              :class="{ 'is-invalid': errors.image }"
              accept="image/*"
            >
            <div v-if="errors.image" class="error-message">{{ errors.image }}</div>
            
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview da imagem" class="preview-img">
              <button type="button" class="btn btn-sm btn-danger remove-image" @click="removeImage">
                Remover
              </button>
            </div>
          </div>
          
          <div class="form-group" v-if="showGtinSearch">
            <label for="gtin">Buscar por GTIN/EAN</label>
            <div class="gtin-search">
              <input 
                type="text" 
                id="gtin" 
                v-model="gtinCode" 
                class="form-control" 
                placeholder="Digite o código de barras"
              >
              <button type="button" class="btn btn-secondary" @click="searchByGtin" :disabled="isGtinLoading">
                {{ isGtinLoading ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="$router.push('/products')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter, useRoute } from 'vue-router';
  
  export default {
    name: 'ProductForm',
    
    setup() {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      
      const isLoading = ref(false);
      const isGtinLoading = ref(false);
      const errors = reactive({});
      const errorMessage = ref('');
      const imageInput = ref(null);
      const imagePreview = ref('');
      const gtinCode = ref('');
      
      // Determina se estamos editando ou criando um produto
      const productId = computed(() => route.params.id);
      const isEditing = computed(() => !!productId.value);
      
      // Determina se deve mostrar o recurso de busca por GTIN
      const showGtinSearch = ref(false);
      
      const categories = computed(() => store.getters['products/allCategories']);
      
      const form = reactive({
        name: '',
        description: '',
        category_id: '',
        purchase_price: '',
        sale_price: '',
        image: null
      });
      
      onMounted(async () => {
        try {
          // Carrega as categorias
          await store.dispatch('products/fetchCategories');
          
          // Se for edição, carrega os dados do produto
          if (isEditing.value) {
            await loadProduct();
          }
        } catch (error) {
          console.error('Error loading data:', error);
          errorMessage.value = 'Erro ao carregar dados iniciais.';
        }
      });
      
      const loadProduct = async () => {
        isLoading.value = true;
        
        try {
          // Em um cenário real, deveria buscar o produto específico
          // Aqui estamos usando um filtro para simular
          const response = await store.dispatch('products/fetchProducts', { id: productId.value });
          
          if (response && response.length > 0) {
            const product = response[0];
            
            // Preenche o formulário com os dados do produto
            form.name = product.name;
            form.description = product.description || '';
            form.category_id = product.category_id || '';
            form.purchase_price = product.purchase_price;
            form.sale_price = product.sale_price;
            
            // Se tiver imagem, mostra o preview
            if (product.image_path) {
              imagePreview.value = product.image_path;
            }
          } else {
            errorMessage.value = 'Produto não encontrado.';
            router.push('/products');
          }
        } catch (error) {
          console.error('Error loading product:', error);
          errorMessage.value = 'Erro ao carregar o produto.';
        } finally {
          isLoading.value = false;
        }
      };
      
      const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        

        //Continuar a partir daqui

        // Validação básica de tipo de arquivo
        if (!file.type.startsWith('image/')) {
          errors.image = 'O arquivo deve ser uma imagem';
          return;
        }
        // Validação de tamanho (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.image = 'A imagem não pode ter mais de 5MB.';
        return;
      }
      
      // Salva o arquivo para envio
      form.image = file;
      
      // Cria uma URL para preview da imagem
      imagePreview.value = URL.createObjectURL(file);
    };
    
    const removeImage = () => {
      form.image = null;
      imagePreview.value = '';
      if (imageInput.value) {
        imageInput.value.value = '';
      }
    };
    
    const searchByGtin = async () => {
      if (!gtinCode.value) return;
      
      isGtinLoading.value = true;
      errorMessage.value = '';
      
      try {
        // Implementação da busca por GTIN/EAN
        // Este é um recurso opcional do desafio
        const response = await store.dispatch('products/searchByGtin', gtinCode.value);
        
        if (response) {
          // Preenche o formulário com os dados retornados
          form.name = response.name || form.name;
          form.description = response.description || form.description;
          
          if (response.category) {
            // Tenta encontrar uma categoria correspondente
            const matchingCategory = categories.value.find(
              c => c.name.toLowerCase() === response.category.toLowerCase()
            );
            
            if (matchingCategory) {
              form.category_id = matchingCategory.id;
            }
          }
          
          if (response.image_url) {
            // Opcionalmente, poderia baixar a imagem ou apenas armazenar a URL
            imagePreview.value = response.image_url;
          }
        } else {
          errorMessage.value = 'Nenhum produto encontrado com este código.';
        }
      } catch (error) {
        console.error('Error searching by GTIN:', error);
        errorMessage.value = 'Erro ao buscar produto pelo GTIN/EAN.';
      } finally {
        isGtinLoading.value = false;
      }
    };
    
    const validateForm = () => {
      // Limpa os erros anteriores
      Object.keys(errors).forEach(key => delete errors[key]);
      
      // Validação do nome
      if (!form.name.trim()) {
        errors.name = 'Nome do produto é obrigatório.';
      } else if (form.name.length < 3) {
        errors.name = 'Nome deve ter pelo menos 3 caracteres.';
      }
      
      // Validação dos preços
      if (!form.purchase_price) {
        errors.purchase_price = 'Preço de compra é obrigatório.';
      } else if (parseFloat(form.purchase_price) < 0) {
        errors.purchase_price = 'Preço de compra não pode ser negativo.';
      }
      
      if (!form.sale_price) {
        errors.sale_price = 'Preço de venda é obrigatório.';
      } else if (parseFloat(form.sale_price) < 0) {
        errors.sale_price = 'Preço de venda não pode ser negativo.';
      }
      
      // Retorna true se não houver erros
      return Object.keys(errors).length === 0;
    };
    
    const saveProduct = async () => {
      if (!validateForm()) return;
      
      isLoading.value = true;
      errorMessage.value = '';
      
      try {
        // Prepara os dados para envio
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description || '');
        formData.append('category_id', form.category_id || '');
        formData.append('purchase_price', form.purchase_price);
        formData.append('sale_price', form.sale_price);
        
        if (form.image) {
          formData.append('image', form.image);
        }
        
        let response;
        
        if (isEditing.value) {
          // Atualiza o produto existente
          formData.append('_method', 'PUT'); // Para simular PUT com FormData
          response = await store.dispatch('products/updateProduct', {
            id: productId.value,
            data: formData
          });
        } else {
          // Cria um novo produto
          response = await store.dispatch('products/createProduct', formData);
        }
        
        if (response) {
          // Redireciona para a lista de produtos com uma mensagem de sucesso
          store.commit('setNotification', {
            type: 'success',
            message: isEditing.value ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!'
          });
          router.push('/products');
        }
      } catch (error) {
        console.error('Error saving product:', error);
        
        if (error.response && error.response.data && error.response.data.errors) {
          // Mapeia os erros de validação retornados pela API
          Object.keys(error.response.data.errors).forEach(key => {
            errors[key] = error.response.data.errors[key][0];
          });
        } else {
          errorMessage.value = isEditing.value 
            ? 'Erro ao atualizar o produto.' 
            : 'Erro ao criar o produto.';
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      form,
      errors,
      errorMessage,
      isLoading,
      isGtinLoading,
      isEditing,
      categories,
      gtinCode,
      imagePreview,
      imageInput,
      showGtinSearch,
      handleImageChange,
      removeImage,
      searchByGtin,
      saveProduct
    };
  }
};

    </script>

<style scoped>
.product-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #4a90e2;
  outline: none;
}

.is-invalid {
  border-color: #dc3545;
}

.error-message {
  margin-top: 5px;
  color: #dc3545;
  font-size: 14px;
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

.price-inputs {
  display: flex;
  gap: 16px;
}

.price-inputs .form-group {
  flex: 1;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  padding: 10px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-weight: 500;
}

.input-group .form-control {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.image-preview {
  margin-top: 10px;
  position: relative;
  display: inline-block;
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.gtin-search {
  display: flex;
  gap: 8px;
}

.gtin-search .form-control {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #555;
}

.btn-outline:hover {
  background-color: #f5f5f5;
}

.btn-primary {
  background-color: #4a90e2;
  color: #fff;
}

.btn-primary:hover {
  background-color: #3a80d2;
}

.btn-primary:disabled {
  background-color: #a0c2ea;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  background-color: #b8bbbe;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
}

.btn-danger:hover {
  background-color: #c82333;
}

.form-control-file {
  padding: 6px 0;
}
</style>