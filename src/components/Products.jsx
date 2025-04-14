import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProduct } from '../context/ProductContext'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

// Schéma de validation Yup
const productSchema = Yup.object().shape({
  name: Yup.string()
    .required('Le nom est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  slug: Yup.string()
    .required('Le slug est requis')
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(50, 'Le slug ne doit pas dépasser 50 caractères')
    .matches(/^[a-z0-9\-]+$/, 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets'),
  price: Yup.number()
    .required('Le prix est requis')
    .min(0, 'Le prix doit être positif')
    .typeError('Le prix doit être un nombre'),
  stock: Yup.number()
    .required('Le stock est requis')
    .min(0, 'Le stock doit être positif')
    .integer('Le stock doit être un nombre entier')
    .typeError('Le stock doit être un nombre'),
  status: Yup.string()
    .required('Le statut est requis')
    .oneOf(['available', 'out_of_stock'], 'Statut invalide'),
  category_id: Yup.number()
    .required('La catégorie est requise')
    .integer('La catégorie doit être un nombre entier')
    .typeError('La catégorie doit être un nombre'),
  images: Yup.array()
    .of(Yup.mixed())
    .test('fileSize', 'Une ou plusieurs images sont trop volumineuses', (value) => {
      if (!value || value.length === 0) return true // Rendre les images optionnelles
      return value.every(file => file.size <= 2 * 1024 * 1024) // 2MB max
    })
    .test('fileType', 'Format d\'image non supporté', (value) => {
      if (!value || value.length === 0) return true // Rendre les images optionnelles
      return value.every(file => 
        ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)
      )
    })
})

function Products() {
  const { user, hasRole } = useAuth()
  const { 
    products, 
    categories,
    loading, 
    error, 
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProductImage,
    setPrimaryImage,
    fetchProduct
  } = useProduct()
  
  const [formMode, setFormMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    price: '', 
    stock: '', 
    status: 'available', 
    category_id: '', 
    images: [] 
  })
  const [formErrors, setFormErrors] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!hasRole('super_admin') && !hasRole('product_manager')) {
      navigate('/403')
      return
    }
  }, [user, hasRole, navigate])

  // Chargement initial des produits et des catégories
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedProduct(null)
    setFormData({ 
      name: '', 
      slug: '', 
      price: '', 
      stock: '', 
      status: 'available', 
      category_id: '', 
      images: [] 
    })
    setFormErrors({})
    setPreviewImages([])
  }

  const openEditForm = async (product) => {
    console.log('Opening edit form for product:', product)
    setFormMode('edit')
    setSelectedProduct(product)
    
    // Récupérer les images du produit
    try {
      const productWithImages = await fetchProduct(product.id)
      console.log('Product with images:', productWithImages)
      
      setFormData({ 
        name: product.name, 
        slug: product.slug, 
        price: product.price, 
        stock: product.stock, 
        status: product.status, 
        category_id: product.category_id, 
        images: [] // On initialise avec un tableau vide pour les nouvelles images
      })
      setFormErrors({})
      
      // Afficher les images existantes du produit
      if (productWithImages.images && productWithImages.images.length > 0) {
        const imageUrls = productWithImages.images.map(img => img.image_url)
        console.log('Setting preview images:', imageUrls)
        setPreviewImages(imageUrls)
      } else {
        setPreviewImages([])
      }
    } catch (error) {
      console.error('Error fetching product images:', error)
      setFormData({ 
        name: product.name, 
        slug: product.slug, 
        price: product.price, 
        stock: product.stock, 
        status: product.status, 
        category_id: product.category_id, 
        images: []
      })
      setPreviewImages([])
    }
  }

  const openDeleteForm = (id) => {
    setFormMode('delete')
    setDeleteId(id)
  }

  const closeForm = () => {
    setFormMode(null)
    setSelectedProduct(null)
    setDeleteId(null)
    setFormErrors({})
    setPreviewImages([])
  }

  const validateField = async (field, value) => {
    try {
      await productSchema.validateAt(field, { [field]: value })
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    } catch (error) {
      setFormErrors({ ...formErrors, [field]: error.message })
    }
  }

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    await validateField(name, value)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }))
      
      // Créer des prévisualisations pour les nouvelles images
      const previews = files.map(file => URL.createObjectURL(file))
      setPreviewImages(prev => [...prev, ...previews])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
    
    // Créer des prévisualisations
    const previews = files.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...previews])
  }

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return { ...prev, images: newImages }
    })
    
    setPreviewImages(prev => {
      const newPreviews = [...prev]
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log('Submitting form with data:', formData)
      const submitData = { ...formData }
      
      // Si nous avons des images, les prendre toutes
      if (formData.images.length > 0) {
        submitData.images = formData.images
      } else if (formMode === 'edit') {
        delete submitData.images;
      }
      
      console.log('Data to be sent:', submitData)
      
      await productSchema.validate(submitData, { abortEarly: false })
      
      if (formMode === 'edit' && selectedProduct) {
        const updatedProduct = await updateProduct(selectedProduct.id, submitData)
        console.log('Product updated:', updatedProduct)
        setSelectedProduct(updatedProduct)
      } else if (formMode === 'create') {
        await createProduct(submitData)
      }
      
      closeForm()
      fetchProducts()
    } catch (error) {
      console.error('Form submission error:', error)
      if (error.inner) {
        const newErrors = {}
        error.inner.forEach(err => {
          newErrors[err.path] = err.message
        })
        setFormErrors(newErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId)
      closeForm()
      fetchProducts()
    }
  }

  const handleDeleteImage = async (productId, imageId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      await deleteProductImage(productId, imageId)
      fetchProducts()
    }
  }

  const openProductDetails = async (product) => {
    setFormMode('details')
    
    try {
      const productWithDetails = await fetchProduct(product.id)
      setSelectedProduct(productWithDetails)
    } catch (error) {
      console.error('Error fetching product details:', error)
      setSelectedProduct(product)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-b-purple-500 border-opacity-50 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl max-w-lg w-full mx-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => fetchProducts()} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all shadow-md"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 relative min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Gestion des Produits
              </h1>
              <p className="text-gray-500 mt-1">Gérez tous vos produits</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openCreateForm}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Retour
              </button>
            </div>
          </div>

          {/* Détails du produit */}
          {formMode === 'details' && selectedProduct && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-10 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Détails du produit
                </h2>
                <button 
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">ID</h3>
                    <p className="text-gray-900">{selectedProduct.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Nom</h3>
                    <p className="text-gray-900">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Slug</h3>
                    <p className="text-gray-900">{selectedProduct.slug}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Prix</h3>
                    <p className="text-gray-900">${selectedProduct.price}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Stock</h3>
                    <p className="text-gray-900">{selectedProduct.stock}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Statut</h3>
                    <p>
                      <span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedProduct.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedProduct.status === 'available' ? 'Disponible' : 'Rupture de stock'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Catégorie</h3>
                    <p className="text-gray-900">
                      {categories.find(cat => cat.id === selectedProduct.category_id)?.name || 'Catégorie inconnue'}
                    </p>
                  </div>
                </div>

                {/* Images du produit */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Images du produit</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {selectedProduct.images && selectedProduct.images.map((image, index) => (
                      <div key={image.id || index} className="relative group">
                        <div className="w-full h-32 relative">
                          <img
                            src={image.image_url.startsWith('http') ? image.image_url : `http://127.0.0.1:8000${image.image_url}`}
                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=Image+non+disponible';
                            }}
                          />
                          {image.is_primary === 1 && (
                            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Principale
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!selectedProduct.images || selectedProduct.images.length === 0) && (
                    <p className="text-gray-500 italic">Aucune image disponible</p>
                  )}
                </div>

                {/* Dates */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Créé le</h3>
                    <p className="text-gray-900">{new Date(selectedProduct.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Dernière mise à jour</h3>
                    <p className="text-gray-900">{new Date(selectedProduct.updated_at).toLocaleString()}</p>
                  </div>
                </div> */}

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={closeForm}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all font-medium"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      closeForm();
                      openEditForm(selectedProduct);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire d'ajout/modification */}
          {(formMode === 'create' || formMode === 'edit') && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-10 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {formMode === 'edit' ? 'Modifier le produit' : 'Ajouter un produit'}
                </h2>
                <button 
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="Nom du produit"
                      disabled={isSubmitting}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.slug ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="slug-du-produit"
                      disabled={isSubmitting}
                    />
                    {formErrors.slug && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                      Prix
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="Prix du produit"
                      disabled={isSubmitting}
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.stock ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="Stock disponible"
                      disabled={isSubmitting}
                    />
                    {formErrors.stock && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                      Statut
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.status ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      disabled={isSubmitting}
                    >
                      <option value="available">Disponible</option>
                      <option value="out_of_stock">Rupture de stock</option>
                    </select>
                    {formErrors.status && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
                      Catégorie
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.category_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Images du produit
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-images"
                      disabled={isSubmitting}
                      multiple
                    />
                    <label htmlFor="product-images" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-1">Glissez-déposez les images ici</p>
                        <p className="text-gray-500 text-sm">ou cliquez pour sélectionner</p>
                        <p className="text-gray-400 text-xs mt-2">Formats acceptés: JPG, PNG, GIF (max 2MB)</p>
                      </div>
                    </label>
                  </div>

                  {formErrors.images && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>
                  )}

                  {/* Aperçu des images */}
                  {previewImages && previewImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu des images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview.startsWith("blob") ? preview : "http://127.0.0.1:8000" + preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (formMode === 'edit' && selectedProduct?.images?.[index]) {
                                  // Si c'est une image existante, la supprimer via l'API
                                  deleteProductImage(selectedProduct.id, selectedProduct.images[index].id)
                                }
                                // Supprimer de la prévisualisation
                                setPreviewImages(prev => prev.filter((_, i) => i !== index))
                                // Supprimer du formData si c'est une nouvelle image
                                if (formData.images?.[index]) {
                                  setFormData(prev => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index)
                                  }))
                                }
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            {formMode === 'edit' && selectedProduct?.images?.[index]?.is_primary && (
                              <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                Principale
                              </span>
                            )}
                            {formMode === 'edit' && selectedProduct?.images?.[index] && !selectedProduct?.images?.[index]?.is_primary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(selectedProduct.id, selectedProduct.images[index].id)}
                                className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Définir comme principale
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        {formMode === 'edit' ? 'Mise à jour...' : 'Ajout...'}
                      </div>
                    ) : (
                      formMode === 'edit' ? 'Mettre à jour' : 'Ajouter'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Confirmation de suppression */}
          {formMode === 'delete' && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-10 w-full max-w-md">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-bold text-red-600">Confirmer la suppression</h2>
                <button 
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                <p className="text-red-700">
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={closeForm}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}

          <div className={`overflow-x-auto ${formMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative overflow-hidden rounded-xl shadow-md border border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b border-gray-200">
                <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{products.length} produits</span></p>
              </div>
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">ID</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Image</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Nom</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Prix</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Stock</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Statut</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={product.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-4 px-4 text-gray-700 font-medium">{product.id}</td>
                        <td className="py-4 px-4">
                          {product.images && product.images.find(img => img.is_primary) ? (
                            <img
                              src={product.images.find(img => img.is_primary).image_url.startsWith('http') 
                                ? product.images.find(img => img.is_primary).image_url 
                                : `http://127.0.0.1:8000${product.images.find(img => img.is_primary).image_url}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Image+non+disponible';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                            <span className="text-gray-800 font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">${product.price}</td>
                        <td className="py-4 px-4 text-gray-700">{product.stock}</td>
                        <td className="py-4 px-4">
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              product.status === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.status === 'available' ? 'Disponible' : 'Rupture de stock'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditForm(product)} 
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </button>
                            <button 
                              onClick={() => openProductDetails(product)} 
                              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:from-blue-500 hover:to-blue-600 transition-all shadow-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Détails
                            </button>
                            <button 
                              onClick={() => openDeleteForm(product.id)} 
                              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all shadow-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 px-4 text-center">
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="font-medium text-gray-800 text-lg">Aucun produit trouvé</p>
                          <p className="text-gray-500 mt-1 mb-4">Commencez par ajouter un nouveau produit</p>
                          <button
                            onClick={openCreateForm}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter un produit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products 