import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from '../utils/axios'

const ProductContext = createContext()

export const useProduct = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/admin/categories')
      setCategories(response.data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.response?.data?.message || 'Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/admin/products')
      setProducts(response.data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProduct = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/admin/products/${id}`)
      console.log('Fetched product:', response.data)
      setSelectedProduct(response.data)
      return response.data
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err.response?.data?.message || 'Erreur lors du chargement du produit')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true)
      setError(null)
      const formData = new FormData()
      
      // Ajouter les champs de base
      Object.keys(productData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, productData[key])
        }
      })
      
      // Ajouter toutes les images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image)
        })
      }
      
      const response = await axios.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setProducts(prev => [...prev, response.data.product])
      return response.data.product
    } catch (err) {
      console.error('Error creating product:', err)
      setError(err.response?.data?.message || 'Erreur lors de la création du produit')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('_method', 'put')
      
      // Ajouter les champs de base
      Object.keys(productData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, productData[key])
        }
      })
      
      // Ajouter les images seulement si elles existent
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images[${index}]`, image)
          }
        })
      }
      
      const response = await axios.post(`/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setProducts(prev => prev.map(product => 
        product.id === id ? response.data.product : product
      ))
      
      return response.data.product
    } catch (err) {
      console.error('Error updating product:', err)
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du produit')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      await axios.delete(`/admin/products/${id}`)
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err.response?.data?.message || 'Erreur lors de la suppression du produit')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProductImage = useCallback(async (productId, imageId) => {
    try {
      setLoading(true)
      setError(null)
      await axios.delete(`/admin/products/${productId}/images/${imageId}`)
      setProducts(prev => prev.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            images: product.images.filter(img => img.id !== imageId)
          }
        }
        return product
      }))
    } catch (err) {
      console.error('Error deleting product image:', err)
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'image')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const setPrimaryImage = useCallback(async (productId, imageId) => {
    try {
      setLoading(true)
      setError(null)
      await axios.put(`/admin/products/${productId}/images/${imageId}/primary`)
      setProducts(prev => prev.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            images: product.images.map(img => ({
              ...img,
              is_primary: img.id === imageId
            }))
          }
        }
        return product
      }))
    } catch (err) {
      console.error('Error setting primary image:', err)
      setError(err.response?.data?.message || 'Erreur lors de la définition de l\'image principale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    products,
    categories,
    loading,
    error,
    selectedProduct,
    fetchProducts,
    fetchCategories,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProductImage,
    setPrimaryImage
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
} 