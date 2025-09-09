/**
 * Composable para manejo de roles y permisos de usuario
 * Basado en el sistema de autenticación independiente
 */

import type { User } from '~/types/types'

export const useUserRole = () => {
  const { user } = useAuth()
  
  // Computed properties para roles
  const userRole = computed(() => user.value?.role || 'user')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isCustomer = computed(() => userRole.value === 'user')
  const isAuthenticated = computed(() => !!user.value)
  
  // Permisos específicos
  const canEdit = computed(() => isAdmin.value)
  const canDelete = computed(() => isAdmin.value)
  const canCreate = computed(() => isAdmin.value)
  const canView = computed(() => isAuthenticated.value)
  
  // Permisos específicos para e-commerce
  const canManageProducts = computed(() => isAdmin.value)
  const canManageOrders = computed(() => isAdmin.value)
  const canManageUsers = computed(() => isAdmin.value)
  const canViewAnalytics = computed(() => isAdmin.value)
  const canManageCategories = computed(() => isAdmin.value)
  const canManageInventory = computed(() => isAdmin.value)
  const canProcessRefunds = computed(() => isAdmin.value)
  const canViewReports = computed(() => isAdmin.value)
  
  // Permisos de cliente
  const canPlaceOrders = computed(() => isAuthenticated.value)
  const canViewOrderHistory = computed(() => isAuthenticated.value)
  const canWriteReviews = computed(() => isAuthenticated.value)
  const canManageWishlist = computed(() => isAuthenticated.value)
  const canManageAddresses = computed(() => isAuthenticated.value)
  
  // Función para verificar permisos específicos
  const hasPermission = (permission: string): boolean => {
    const permissions = {
      // Permisos de administración
      'admin:all': isAdmin.value,
      'admin:users': isAdmin.value,
      'admin:reports': isAdmin.value,
      'admin:refunds': isAdmin.value,
      
      // Permisos de gestión
      'manage:products': canManageProducts.value,
      'manage:orders': canManageOrders.value,
      'manage:categories': canManageCategories.value,
      'manage:inventory': canManageInventory.value,
      'manage:analytics': canViewAnalytics.value,
      
      // Permisos de edición
      'edit:products': canEdit.value,
      'edit:orders': canEdit.value,
      'edit:categories': canEdit.value,
      
      // Permisos de eliminación
      'delete:products': canDelete.value,
      'delete:orders': canDelete.value,
      'delete:categories': canDelete.value,
      'delete:users': canDelete.value,
      
      // Permisos de creación
      'create:products': canCreate.value,
      'create:categories': canCreate.value,
      'create:orders': canCreate.value,
      
      // Permisos de visualización
      'view:products': canView.value,
      'view:orders': canView.value,
      'view:analytics': canViewAnalytics.value,
      'view:reports': canViewReports.value,
      
      // Permisos de cliente
      'customer:orders': canPlaceOrders.value,
      'customer:reviews': canWriteReviews.value,
      'customer:wishlist': canManageWishlist.value,
      'customer:addresses': canManageAddresses.value,
    }
    
    return permissions[permission as keyof typeof permissions] || false
  }
  
  // Función para obtener el nivel de acceso
  const getAccessLevel = (): number => {
    if (isAdmin.value) return 3
    if (isCustomer.value) return 1
    return 0
  }
  
  // Función para verificar si puede acceder a una ruta
  const canAccessRoute = (route: string): boolean => {
    const routePermissions = {
      '/admin': ['admin:all'],
      '/admin/users': ['admin:users'],
      '/admin/reports': ['admin:reports'],
      '/admin/analytics': ['view:analytics'],
      '/admin/products': ['manage:products'],
      '/admin/orders': ['manage:orders'],
      '/admin/categories': ['manage:categories'],
      '/admin/inventory': ['manage:inventory'],
      '/dashboard': ['view:analytics'],
      '/profile': ['customer:orders'],
      '/orders': ['customer:orders'],
      '/wishlist': ['customer:wishlist'],
      '/reviews': ['customer:reviews'],
    }
    
    const requiredPermissions = routePermissions[route as keyof typeof routePermissions] || []
    
    if (requiredPermissions.length === 0) return true
    
    return requiredPermissions.some(permission => hasPermission(permission))
  }
  
  // Función para obtener el menú según el rol
  const getMenuItems = () => {
    if (isAdmin.value) {
      return [
        { label: 'Dashboard', icon: 'i-heroicons-home', to: '/admin' },
        { label: 'Productos', icon: 'i-heroicons-shopping-bag', to: '/admin/products' },
        { label: 'Órdenes', icon: 'i-heroicons-shopping-cart', to: '/admin/orders' },
        { label: 'Categorías', icon: 'i-heroicons-tag', to: '/admin/categories' },
        { label: 'Inventario', icon: 'i-heroicons-cube', to: '/admin/inventory' },
        { label: 'Usuarios', icon: 'i-heroicons-users', to: '/admin/users' },
        { label: 'Analytics', icon: 'i-heroicons-chart-bar', to: '/admin/analytics' },
        { label: 'Reportes', icon: 'i-heroicons-document-chart-bar', to: '/admin/reports' },
      ]
    }
    
    return [
      { label: 'Inicio', icon: 'i-heroicons-home', to: '/' },
      { label: 'Productos', icon: 'i-heroicons-shopping-bag', to: '/shop' },
      { label: 'Mis Órdenes', icon: 'i-heroicons-shopping-cart', to: '/orders' },
      { label: 'Wishlist', icon: 'i-heroicons-heart', to: '/wishlist' },
      { label: 'Perfil', icon: 'i-heroicons-user', to: '/profile' },
    ]
  }
  
  return {
    // Estado
    user,
    userRole,
    isAdmin,
    isCustomer,
    isAuthenticated,
    
    // Permisos básicos
    canEdit,
    canDelete,
    canCreate,
    canView,
    
    // Permisos específicos
    canManageProducts,
    canManageOrders,
    canManageUsers,
    canViewAnalytics,
    canManageCategories,
    canManageInventory,
    canProcessRefunds,
    canViewReports,
    
    // Permisos de cliente
    canPlaceOrders,
    canViewOrderHistory,
    canWriteReviews,
    canManageWishlist,
    canManageAddresses,
    
    // Funciones
    hasPermission,
    getAccessLevel,
    canAccessRoute,
    getMenuItems,
  }
}


