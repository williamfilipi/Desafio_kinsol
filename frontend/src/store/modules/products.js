import api from '@/services/api';

export default {
  namespaced: true,
  
  state: {
    products: [],
    categories: [],
    loading: false,
    error: null
  },
  
  getters: {
    allProducts: state => state.products,
    allCategories: state => state.categories,
    isLoading: state => state.loading,
    error: state => state.error
  },
  
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    ADD_PRODUCT(state, product) {
      state.products.unshift(product);
    },
    UPDATE_PRODUCT(state, updatedProduct) {
      const index = state.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products.splice(index, 1, updatedProduct);
      }
    },
    DELETE_PRODUCT(state, productId) {
      state.products = state.products.filter(p => p.id !== productId);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  
  actions: {
    async fetchProducts({ commit }, filters = {}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await api.get('/products', { params: filters });
        commit('SET_PRODUCTS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to fetch products');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchCategories({ commit }) {
      try {
        const response = await api.get('/categories');
        commit('SET_CATEGORIES', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
      }
    },
    
    async createProduct({ commit }, productData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Use FormData para enviar arquivos
        const formData = new FormData();
        
        // Adicione todos os campos do produto ao FormData
        Object.keys(productData).forEach(key => {
          if (key === 'image' && productData[key]) {
            // Se for uma imagem, adiciona como arquivo
            formData.append('image', productData[key]);
          } else if (productData[key] !== null && productData[key] !== undefined) {
            // Para outros campos, adiciona como string
            formData.append(key, productData[key]);
          }
        });
        
        const response = await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        commit('ADD_PRODUCT', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to create product');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateProduct({ commit }, { id, productData }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
          if (key === 'image' && productData[key] && typeof productData[key] !== 'string') {
            formData.append('image', productData[key]);
          } else if (productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key]);
          }
        });
        
        // Adicione o método PUT via _method para suportar FormData
        formData.append('_method', 'PUT');
        
        const response = await api.post(`/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        commit('UPDATE_PRODUCT', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to update product');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteProduct({ commit }, id) {
      try {
        await api.delete(`/products/${id}`);
        commit('DELETE_PRODUCT', id);
      } catch (error) {
        console.error('Failed to delete product:', error);
        throw error;
      }
    },
    
    async exportProductsXlsx() {
      try {
        const response = await api.get('/products/export', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return true;
      } catch (error) {
        console.error('Failed to export products:', error);
        throw error;
      }
    },
    
    async searchProductByGtin({ commit }, gtin) {
      commit('SET_LOADING', true);
      
      try {
        const response = await api.get(`/products/search-gtin/${gtin}`);
        return response.data;
      } catch (error) {
        console.error('Failed to search product by GTIN:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};