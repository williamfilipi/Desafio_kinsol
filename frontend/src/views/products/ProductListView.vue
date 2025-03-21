<template>
    <div class="product-list-container">
      <div class="header">
        <h1 class="title">Produtos</h1>
        <router-link v-if="isAuthenticated" to="/products/create" class="btn btn-primary">
          <i class="fas fa-plus"></i> Novo Produto
        </router-link>
      </div>
      
      <div class="filter-section">
        <div class="filter-form">
          <div class="form-group">
            <label for="search">Buscar</label>
            <input 
              type="text" 
              id="search" 
              v-model="filters.name" 
              class="form-control" 
              placeholder="Nome do produto"
              @input="debounceSearch"
            >
          </div>
          
          <div class="form-group">
            <label for="category">Categoria</label>
            <select id="category" v-model="filters.category_id" class="form-control" @change="applyFilters">
              <option value="">Todas as categorias</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div v-if="!isAuthenticated" class="price-range">
            <label>Faixa de Preço</label>
            <div class="price-inputs">
              <input 
                type="number" 
                v-model.number="filters.min_price" 
                class="form-control" 
                placeholder="Mínimo" 
                min="0"
                @change="applyFilters"
              >
              <span class="price-separator">a</span>
              <input 
                type="number" 
                v-model.number="filters.max_price" 
                class="form-control" 
                placeholder="Máximo" 
                min="0"
                @change="applyFilters"
              >
            </div>
          </div>
          
          <button class="btn btn-secondary" @click="resetFilters">
            Limpar Filtros
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Carregando produtos...</p>
      </div>
      
      <div v-else-if="products.length === 0" class="no-results">
        <p>Nenhum produto encontrado.</p>
      </div>
      
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image">
            <img 
              :src="product.image_path || '/img/no-image.png'" 
              :alt="product.name" 
              class="img-fluid"
            >
          </div>
          <div class="product-details">
            <h3 class="product-name">{{ product.name }}</h3>
            <p v-if="product.description" class="product-description">{{ truncate(product.description, 100) }}</p>
            <p class="product-category">{{ getCategoryName(product.category_id) }}</p>
            <p class="product-price">R$ {{ formatPrice(product.sale_price) }}</p>
            
            <div v-if="isAuthenticated" class="product-actions">
              <router-link :to="`/products/${product.id}/edit`" class="btn btn-sm btn-outline">
                Editar
              </router-link>
              <button @click="confirmDelete(product)" class="btn btn-sm btn-danger">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isAuthenticated && products.length > 0" class="export-section">
        <button @click="exportProducts" class="btn btn-success">
          <i class="fas fa-file-export"></i> Exportar para Excel
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import {reactive, computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
  // import { useRouter } from 'vue-router';
  
  export default {
    name: 'ProductListView',
    
    setup() {
      const store = useStore();
      // const router = useRouter();
      
      const products = computed(() => store.getters['products/allProducts']);
      const categories = computed(() => store.getters['products/allCategories']);
      const isLoading = computed(() => store.getters['products/isLoading']);
      const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
      
      const filters = reactive({
        name: '',
        category_id: '',
        min_price: '',
        max_price: ''
      });
      
      let searchTimeout = null;
      
      const debounceSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          applyFilters();
        }, 500);
      };
      
      const applyFilters = async () => {
        const apiFilters = {};
        
        if (filters.name) apiFilters.name = filters.name;
        if (filters.category_id) apiFilters.category_id = filters.category_id;
        if (filters.min_price) apiFilters.min_price = filters.min_price;
        if (filters.max_price) apiFilters.max_price = filters.max_price;
        
        await store.dispatch('products/fetchProducts', apiFilters);
      };
      
      const resetFilters = () => {
        filters.name = '';
        filters.category_id = '';
        filters.min_price = '';
        filters.max_price = '';
        applyFilters();
      };
      
      const confirmDelete = (product) => {
        if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
          deleteProduct(product.id);
        }
      };
      
      const deleteProduct = async (id) => {
        try {
          await store.dispatch('products/deleteProduct', id);
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Ocorreu um erro ao excluir o produto.');
        }
      };
      
      const exportProducts = async () => {
        try {
          await store.dispatch('products/exportProductsXlsx');
        } catch (error) {
          console.error('Error exporting products:', error);
          alert('Ocorreu um erro ao exportar os produtos.');
        }
      };
      
      const getCategoryName = (categoryId) => {
        if (!categoryId) return 'Sem categoria';
        const category = categories.value.find(c => c.id === categoryId);
        return category ? category.name : 'Categoria não encontrada';
      };
      
      const formatPrice = (price) => {
        return Number(price).toFixed(2).replace('.', ',');
      };
      
      const truncate = (text, length) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
        };
        onMounted(async () => {
      try {
        // Carrega as categorias
        await store.dispatch('products/fetchCategories');
        // Carrega os produtos sem filtros inicialmente
        await store.dispatch('products/fetchProducts');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    });
    
    return {
      products,
      categories,
      isLoading,
      isAuthenticated,
      filters,
      applyFilters,
      debounceSearch,
      resetFilters,
      confirmDelete,
      exportProducts,
      getCategoryName,
      formatPrice,
      truncate
    };
  }
};
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.filter-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.form-group {
  margin-bottom: 0;
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

.price-range {
  display: flex;
  flex-direction: column;
}

.price-inputs {
  display: flex;
  align-items: center;
}

.price-separator {
  margin: 0 10px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 60px 0;
  font-size: 18px;
  color: #666;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  margin: 0 0 10px;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
}

.product-category {
  color: #4CAF50;
  font-size: 14px;
  margin-bottom: 10px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.product-actions {
  display: flex;
  gap: 10px;
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
  text-decoration: none;
  text-align: center;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
}

.btn-outline:hover {
  background-color: #4CAF50;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.export-section {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
}

.img-fluid {
  max-width: 100%;
  height: auto;
}
</style>