# Historias de Usuario - Sistema de E-commerce en Power Platform

## 1. Módulo de Autenticación (Power Apps + Dataverse)

### HU-001: Gestión de Usuarios y Roles
**Como** administrador del sistema  
**Quiero** gestionar los usuarios y sus roles  
**Para** controlar el acceso a la aplicación  

**Criterios de Aceptación:**
- Usar autenticación de Microsoft 365
- Configurar dos roles en Dataverse: Admin y User
- Tabla de Usuarios en Dataverse con campos:
  - Email (texto)
  - Nombre (texto)
  - Rol (opción: Admin/User)
  - Estado (opción: Activo/Inactivo) 

### HU-002: Registro de Usuarios
**Como** visitante  
**Quiero** poder registrarme en la aplicación  
**Para** acceder como usuario regular  

**Criterios de Aceptación:**
- Formulario de registro en Power Apps
- Validación de correo electrónico
- Asignación automática del rol "User"
- Almacenamiento en tabla Usuarios de Dataverse

## 2. Módulo de Administración (Power Apps)

### HU-003: Gestión de Productos
**Como** administrador  
**Quiero** gestionar el catálogo de productos  
**Para** mantener actualizada la tienda  

**Criterios de Aceptación:**
- CRUD completo de productos en Dataverse con campos:
  - Nombre del producto
  - Precio
  - Cantidad disponible
  - Imagen (usando biblioteca de imágenes de Power Apps)
- Vista de galería para productos
- Formularios de creación/edición
- Botón de eliminación con confirmación

### HU-004: Gestión de Administradores
**Como** administrador principal  
**Quiero** poder asignar rol de administrador a otros usuarios  
**Para** distribuir la gestión del sistema  

**Criterios de Aceptación:**
- Vista de usuarios registrados
- Capacidad de cambiar rol a "Admin"
- Restricción de acceso solo a administradores
- Confirmación de cambios de rol

## 3. Módulo de Usuario (Power Apps)

### HU-005: Catálogo de Productos
**Como** usuario  
**Quiero** ver los productos disponibles  
**Para** seleccionar los que deseo comprar  

**Criterios de Aceptación:**
- Vista de galería con productos disponibles
- Mostrar precio y cantidad disponible
- Botón para agregar al carrito
- Campo para especificar cantidad

### HU-006: Gestión del Carrito
**Como** usuario  
**Quiero** gestionar mi carrito de compras  
**Para** revisar y confirmar mi pedido  

**Criterios de Aceptación:**
- Tabla Carrito en Dataverse con campos:
  - Usuario (lookup a Usuarios)
  - Producto (lookup a Productos)
  - Cantidad
  - Fecha
- Vista del contenido del carrito
- Capacidad de modificar cantidades
- Botón para eliminar items

## 4. Módulo de Pedidos (Power Apps + Power Automate)

### HU-007: Proceso de Pedido
**Como** usuario  
**Quiero** confirmar mi pedido  
**Para** que sea procesado  

**Criterios de Aceptación:**
- Botón de confirmación de pedido
- Flujo de Power Automate que:
  - Envía email de confirmación al usuario
  - Notifica al administrador
  - Actualiza el inventario
- Tabla Pedidos en Dataverse

### HU-008: Gestión de Estado de Pedidos
**Como** administrador  
**Quiero** actualizar el estado de los pedidos  
**Para** mantener informados a los usuarios  

**Criterios de Aceptación:**
- Estados del pedido: Pendiente, Enviado, Entregado
- Flujo de Power Automate para:
  - Actualizar estado en Dataverse
  - Enviar notificación por email al usuario
- Vista de todos los pedidos para administradores

## 5. Notificaciones (Power Automate)

### HU-009: Sistema de Notificaciones
**Como** usuario del sistema  
**Quiero** recibir notificaciones por email  
**Para** estar informado sobre mis pedidos  

**Criterios de Aceptación:**
- Flujos de Power Automate para:
  - Confirmación de registro
  - Confirmación de pedido
  - Actualización de estado de pedido
- Usar plantillas de email personalizadas
- Incluir detalles relevantes en cada notificación