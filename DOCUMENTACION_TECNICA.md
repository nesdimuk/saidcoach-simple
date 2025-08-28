# SaidCoach - Sistema de Tracking Nutricional

## 📋 Descripción General

**SaidCoach** es una aplicación web progresiva (PWA) para el seguimiento nutricional basada en el método **Precision Nutrition**. La app permite a entrenadores gestionar clientes y a usuarios trackear su alimentación diaria usando el sistema de "porciones de mano".

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Framework**: Next.js 15.5.1 (React 19.1.0)
- **Base de Datos**: Redis Cloud (para datos de usuarios) + Prisma/SQLite (backup local)
- **Estilos**: TailwindCSS 4.0
- **Lenguajes**: TypeScript + JavaScript
- **Deploy**: Vercel (configurado para PWA)
- **Autenticación**: Sistema de códigos únicos (sin passwords)

### Estructura del Proyecto
```
saidcoach-simple/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── goals/         # Gestión de objetivos diarios
│   │   │   ├── portions/      # Tracking de porciones
│   │   │   ├── trainer/       # APIs para entrenadores
│   │   │   ├── user-profile/  # Perfiles de usuario
│   │   │   └── weight/        # Seguimiento de peso
│   │   ├── dashboard/         # Panel usuario
│   │   │   ├── contador/      # Contador porciones diario
│   │   │   └── reportes/      # Reportes usuario
│   │   ├── entrenador/        # Panel entrenador
│   │   │   └── cliente/[code] # Vista individual cliente
│   │   ├── login/             # Autenticación por código
│   │   └── page.tsx           # Landing page
│   └── lib/
│       ├── metabolismCalculator.js # Cálculos PN
│       └── redis.js           # Cliente Redis
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── icon-*.png            # Iconos PWA
│   └── icons/                 # Iconos de calidad alimentaria
└── prisma/
    └── schema.prisma          # Schema base de datos
```

## 🔧 Funcionalidades Principales

### 👤 Para Usuarios (Clientes)
1. **Login por Código**: Sistema sin contraseña usando códigos únicos
2. **Calculadora Nutricional**: 
   - Calcula TMB (Tasa Metabólica Basal) usando fórmulas Harris-Benedict
   - Calcula TDEE (Total Daily Energy Expenditure) 
   - Determina objetivos calóricos según meta (pérdida/mantenimiento/ganancia)
   - Convierte calorías a porciones del método PN
3. **Contador Diario**:
   - Tracking de porciones: Proteína (P), Carbohidratos (C), Grasas (G), Verduras (V)
   - Sistema de calidad: P1/P2/P3, C1/C2/C3, G1/G2/G3
   - Soporte para medias porciones
   - Guardado automático en tiempo real
4. **Seguimiento de Peso**: Registro diario con gráficos
5. **Reportes**: Visualización de progreso y estadísticas

### 👨‍💼 Para Entrenadores
1. **Panel de Clientes**: Vista general de todos los usuarios activos
2. **Vista Individual**: 
   - Historial completo de cada cliente
   - Datos nutricionales y de peso
   - Análisis de adherencia al plan
3. **Reportes Avanzados**: 
   - Gráficos de calidad nutricional
   - Tendencias de peso
   - Métricas de cumplimiento

## 🧮 Sistema de Cálculos Nutricionales

### Fórmulas Implementadas
```javascript
// TMB (Tasa Metabólica Basal)
Hombres: TMB = 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × edad)
Mujeres: TMB = 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × edad)

// TDEE (Total Daily Energy Expenditure)
TDEE = TMB × Factor de Actividad
- Sedentario: 1.2
- Ligero: 1.375  
- Moderado: 1.55
- Activo: 1.725
- Muy Activo: 1.9

// Objetivos Calóricos
Pérdida: TDEE - 500 cal
Mantenimiento: TDEE
Ganancia: TDEE + 300 cal
```

### Conversión a Porciones PN
- **Proteína**: 4 cal/g → 1 palma ≈ 25g ≈ 100 cal
- **Carbohidratos**: 4 cal/g → 1 puño ≈ 25g ≈ 100 cal  
- **Grasas**: 9 cal/g → 1 pulgar ≈ 10g ≈ 90 cal
- **Verduras**: Libres (mínimo recomendado por salud)

## 🗄️ Gestión de Datos

### Redis Cloud (Producción)
```javascript
// Estructura de datos
user-profile-{CODE}: {
  name, gender, goal, activity, preference
}
daily-portions-{CODE}-{DATE}: {
  P: number, C: number, G: number, V: number,
  quality: { P1: number, P2: number, ... }
}
daily-weight-{CODE}-{DATE}: number
daily-goals-{CODE}: {
  P: number, C: number, G: number, V: number
}
```

### LocalStorage (Backup)
- Mismo formato que Redis
- Sincronización automática
- Fallback para modo offline

## 🔐 Sistema de Autenticación

### Códigos de Usuario
- Formato: `SAID-NOMBRE-AAAA` o personalizado
- Sin contraseñas (más simple para clientes)
- Cada código es único por usuario
- Persistencia en localStorage + Redis

### Flujo de Acceso
1. Usuario ingresa código en `/login`
2. Sistema verifica si existe perfil
3. Usuario nuevo → `/dashboard` (configurar perfil)
4. Usuario existente → `/dashboard/contador`

## 📱 Características PWA

### Capacidades Offline
- Manifest.json configurado
- Iconos personalizados (192x192, 512x512)
- Installable en dispositivos móviles
- Funciona sin conexión (datos en localStorage)

### Meta Tags Optimizados
- Theme color personalizado
- Viewport responsive
- Apple Web App compatible
- Accesos directos configurados

## 🐛 Problemas Conocidos

### Issues Actuales
1. **Persistencia de Datos**: Ocasionalmente los datos no se guardan
2. **Conexión Redis**: Errores intermitentes de conectividad  
3. **Validación Formularios**: Falta validación robusta
4. **Manejo de Errores**: Mensajes genéricos, falta logging detallado

### Areas de Mejora
- [ ] Implementar logging sistemático
- [ ] Agregar tests unitarios
- [ ] Mejorar UX de errores
- [ ] Optimizar performance
- [ ] Backup automático de datos
- [ ] Notificaciones push

## 🚀 Deployment

### Configuración Vercel
- Auto-deploy desde repositorio
- Variables de entorno: `REDIS_URL`
- Dominio personalizado disponible
- SSL/HTTPS automático

### Variables de Entorno Requeridas
```bash
REDIS_URL=redis://default:password@host:port
```

## 📊 Métricas y Monitoreo

### Analytics Implementados
- Tracking de uso básico
- Monitoreo de errores del cliente
- Logs de servidor en Vercel

### KPIs Importantes
- Usuarios activos diarios
- Adherencia al tracking
- Tiempo de sesión promedio
- Tasa de retención

---

## 💡 Guía para IA Specialist

Esta aplicación es un **sistema completo de coaching nutricional** que:

1. **Calcula planes personalizados** usando ciencia nutricional real
2. **Simplifica el tracking** con el método de porciones de mano  
3. **Conecta entrenadores y clientes** en una plataforma unificada
4. **Funciona offline** como PWA en móviles
5. **Escala automáticamente** con arquitectura serverless

**Tecnologías clave**: Next.js 15, React 19, Redis Cloud, TailwindCSS, PWA

**Usuarios objetivo**: Entrenadores personales y sus clientes que buscan un método simple pero científico para el seguimiento nutricional.

**Diferencial**: Implementación fiel del método Precision Nutrition con UX optimizada para el mundo real del coaching fitness.