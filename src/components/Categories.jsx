import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCategory } from '../context/CategoryContext'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'


const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Le nom est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Le nom ne doit contenir que des lettres, chiffres, espaces, tirets et underscores'),
  slug: Yup.string()
    .required('Le slug est requis')
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(50, 'Le slug ne doit pas dépasser 50 caractères')
    .matches(/^[a-z0-9\-]+$/, 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets')
})

function Categories() {
  const { user, hasRole } = useAuth()
  const { 
    categories, 
    loading, 
    error, 
    fetchCategories, 
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategory()
  
  const [formMode, setFormMode] = useState(null) 
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [formErrors, setFormErrors] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!hasRole('super_admin')) {
      navigate('/403')
      return
    }
  }, [user])

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedCategory(null)
    setFormData({ name: '', slug: '' })
    setFormErrors({})
  }

  const openEditForm = (category) => {
    setFormMode('edit')
    setSelectedCategory(category)
    setFormData({ 
      name: category.name, 
      slug: category.slug 
    })
    setFormErrors({})
  }

  const openDeleteForm = (id) => {
    setFormMode('delete')
    setDeleteId(id)
  }

  const closeForm = () => {
    setFormMode(null)
    setSelectedCategory(null)
    setDeleteId(null)
    setFormErrors({})
  }

  const validateField = async (field, value) => {
    try {
      await categorySchema.validateAt(field, { [field]: value })
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

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      setFormData({ ...formData, slug })
      validateField('slug', slug)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await categorySchema.validate(formData, { abortEarly: false })
      
      if (formMode === 'edit' && selectedCategory) {
        await updateCategory(selectedCategory.id, formData)
      } else if (formMode === 'create') {
        await createCategory(formData)
      }
      
      closeForm()
    } catch (error) {
      if (error.inner) {
        const newErrors = {}
        error.inner.forEach(err => {
          newErrors[err.path] = err.message
        })
        setFormErrors(newErrors)
      } else {
        console.error('Form submission error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCategory(deleteId)
      closeForm()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-b-purple-500 border-opacity-50 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Chargement des catégories...</p>
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
              onClick={() => fetchCategories()} 
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
                Gestion des Catégories
              </h1>
              <p className="text-gray-500 mt-1">Gérez toutes vos catégories de produits</p>
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

          {/* Formulaire d'ajout/modification */}
          {(formMode === 'create' || formMode === 'edit') && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-10 w-full max-w-md">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {formMode === 'edit' ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
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
                    onBlur={generateSlug}
                    className={`w-full p-3 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    placeholder="Nom de la catégorie"
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
                  <div className="flex">
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${formErrors.slug ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="slug-de-la-categorie"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="ml-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-medium"
                      disabled={isSubmitting}
                    >
                      Générer
                    </button>
                  </div>
                  {formErrors.slug && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
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
                  Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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
                <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{Array.isArray(categories) ? categories.length : 0} catégories</span></p>
              </div>
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">ID</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Nom</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Slug</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Date de création</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category, index) => (
                      <tr key={category.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-4 px-4 text-gray-700 font-medium">{category.id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                            <span className="text-gray-800 font-medium">{category.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-mono text-xs">{category.slug}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {category.created_at ? (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(category.created_at).toLocaleDateString()}</span>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditForm(category)} 
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </button>
                            <button 
                              onClick={() => openDeleteForm(category.id)} 
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
                      <td colSpan="5" className="py-10 px-4 text-center">
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="font-medium text-gray-800 text-lg">Aucune catégorie trouvée</p>
                          <p className="text-gray-500 mt-1 mb-4">Commencez par ajouter une nouvelle catégorie</p>
                          <button
                            onClick={openCreateForm}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter une catégorie
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

export default Categories 