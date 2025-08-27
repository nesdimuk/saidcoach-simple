# SaidCoach Simple

## 🥗 Sistema de Seguimiento Nutricional basado en Precision Nutrition

SaidCoach Simple es una herramienta web diseñada para coaches y clientes que implementa el método de porciones de mano de Precision Nutrition de manera digital, permitiendo un seguimiento preciso y personalizado de la alimentación diaria.

## 🚀 Características Principales

### Para Clientes
- **Calculadora Personalizada**: Genera plan nutricional basado en género, objetivo, actividad y preferencias
- **Contador Visual de Porciones**: Interfaz intuitiva con iconos de calidad nutricional (P1/P2/P3, C1/C2/C3, G1/G2/G3, V)
- **Medias Porciones**: Soporte para 0.5 porciones en proteínas y carbohidratos
- **Seguimiento de Peso**: Registro diario de peso corporal
- **Gráficos de Calidad**: Visualización dinámica de la calidad nutricional diaria
- **Reportes Automáticos**: Generación de reportes para enviar al coach

### Para Coaches
- **Panel de Control**: Vista general de todos los clientes activos
- **Generación de Códigos**: Creación de códigos únicos para nuevos clientes
- **Estadísticas de Adherencia**: Seguimiento del cumplimiento de objetivos
- **Reportes Detallados**: Análisis completo de progreso con gráficos de calidad nutricional
- **Historial Completo**: Acceso a datos históricos de todos los clientes

## 🏗️ Arquitectura Técnica

- **Frontend**: Next.js 15 con TypeScript y Tailwind CSS
- **Almacenamiento**: LocalStorage con claves únicas por usuario
- **Metodología**: Algoritmo oficial de Precision Nutrition
- **Diseño**: Responsive, optimizado para móviles y desktop

## 📱 Flujo de Uso

### Para Clientes:
1. **Acceso**: Ingresar con código proporcionado por el coach
2. **Perfil**: Completar datos personales (edad, peso, altura, género, actividad, objetivo)
3. **Cálculo**: El sistema genera porciones exactas basadas en el algoritmo PN
4. **Seguimiento**: Usar el contador diario para registrar porciones consumidas
5. **Reportes**: Enviar progreso al coach automáticamente

### Para Coaches:
1. **Autenticación**: Acceso con código de entrenador
2. **Gestión**: Generar códigos para nuevos clientes
3. **Monitoreo**: Ver estadísticas de adherencia en tiempo real
4. **Análisis**: Revisar reportes detallados con gráficos de calidad

## 🎯 Sistema de Calidad Nutricional

### Categorías de Alimentos:
- **P1, C1, G1 (Verde)**: "Comer Más" - Alimentos de alta calidad
- **P2, C2, G2 (Amarillo)**: "Comer Ocasionalmente" - Alimentos moderados
- **P3, C3, G3 (Rojo)**: "Comer Menos" - Alimentos a limitar

### Métricas de Calidad:
- Porcentaje dinámico basado en selecciones diarias
- Feedback motivacional según rendimiento
- Gráficos visuales tricolor
- Seguimiento histórico de tendencias

## 📊 Funcionalidades Avanzadas

### Reportes para Coach:
- Cumplimiento promedio por macronutriente
- Análisis de calidad nutricional promedio
- Seguimiento de cambio de peso
- Detalle diario completo
- Exportación a texto para WhatsApp/Email

### Edición de Datos:
- Corrección de días anteriores
- Ajuste de objetivos personalizados
- Actualización de peso histórico

### Multi-Usuario:
- Aislamiento completo de datos por código de usuario
- Cambio de usuario sin pérdida de datos
- Gestión centralizada por parte del coach

### 🧮 Calculadora Precision Nutrition
- **Algoritmo oficial**: Implementa las tablas exactas de PN con 72 combinaciones diferentes
- **Personalización completa**: Considera género, objetivo, nivel de actividad y preferencias alimentarias
- **Valores exactos**: No rangos confusos, sino porciones específicas calculadas
- **Multi-usuario**: Soporte para cambiar entre clientes sin mezclar datos

### 📊 Contador Visual de Porciones
- **Iconos de calidad**: P1/P2/P3 (proteínas), C1/C2/C3 (carbohidratos), G1/G2/G3 (grasas), V (verduras)
- **Medias porciones**: Soporte para 0.5 en proteínas y carbohidratos
- **Progreso en tiempo real**: Muestra "consumido/objetivo" (ej: 3/6)
- **Colores intuitivos**: Verde (completado), amarillo (progreso), rojo (faltante)
- **Gráficos de calidad**: Visualización tricolor de la calidad nutricional diaria

### ⚖️ Tracking de Peso
- **Registro diario**: Captura peso con fecha automática
- **Tips integrados**: Recordatorios para pesarse en condiciones óptimas
- **Histórico**: Mantiene registro de todos los pesos registrados
- **Análisis de tendencias**: Calcula cambios de peso en reportes

### 📈 Sistema de Reportes
- **Análisis de cumplimiento**: Porcentajes de adherencia por macronutriente
- **Calidad nutricional**: Gráficos y estadísticas de calidad promedio
- **Cambios de peso**: Tracking automático de variaciones
- **Períodos flexibles**: Reportes de 7, 14 o 30 días
- **Exportación fácil**: Copia al portapapeles para envío por email/WhatsApp
- **Edición histórica**: Posibilidad de corregir días anteriores

## 🔧 Instalación y Configuración

```bash
# Clonar el repositorio
git clone [repository-url]
cd saidcoach-simple

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

## 📋 Requisitos del Sistema

- Node.js 18 o superior
- Navegador web moderno con soporte para LocalStorage
- Resolución mínima: 320px (móvil)

## 🏃‍♂️ Primeros Pasos

### Como Coach:
1. Navegar a `/entrenador`
2. Ingresar código de entrenador: `SAIDCOACH2024`
3. Generar códigos únicos para clientes
4. Monitorear progreso desde el panel

### Como Cliente:
1. Navegar a `/login`
2. Ingresar código proporcionado por el coach
3. Completar perfil en `/dashboard`
4. Usar contador diario en `/dashboard/contador`
5. Enviar reportes desde `/dashboard/reportes`

## 🔐 Seguridad y Privacidad

- Datos almacenados localmente en el navegador del usuario
- Códigos únicos para aislamiento de datos
- No requiere servidores externos para funcionar
- Compatible con uso offline

## 📈 Métricas y Seguimiento

### Indicadores Clave:
- **Adherencia**: Porcentaje de cumplimiento por macronutriente
- **Calidad**: Distribución de alimentos por categoría PN
- **Consistencia**: Días consecutivos de registro
- **Progreso**: Tendencia de peso y composición

### Visualizaciones:
- Barras de progreso tricolor
- Gráficos de tendencias
- Indicadores de estado (verde/amarillo/rojo)
- Resúmenes estadísticos

## 🎨 Interfaz de Usuario

### Diseño Centrado en el Usuario:
- **Móvil Primero**: Optimizado para smartphones
- **Iconos Intuitivos**: Representaciones visuales claras
- **Feedback Inmediato**: Respuestas visuales a acciones
- **Navegación Simple**: Flujo lógico entre pantallas

### Accesibilidad:
- Contraste adecuado para lectura
- Botones de tamaño apropiado para touch
- Textos legibles en dispositivos pequeños
- Estados de carga y feedback visual

## 🔄 Ciclo de Uso Típico

1. **Setup Inicial**: Coach genera código → Cliente se registra → Completa perfil
2. **Uso Diario**: Cliente registra porciones → Pesa diariamente → Ve progreso
3. **Reporte Semanal**: Cliente envía reporte → Coach analiza → Ajusta plan
4. **Iteración**: Proceso se repite con mejoras continuas

## 💻 Tecnología

### Stack Técnico
- **Frontend**: Next.js 15 con TypeScript
- **Estilos**: Tailwind CSS
- **Almacenamiento**: LocalStorage con códigos únicos
- **Iconos**: PNG personalizados para cada tipo de porción
- **Algoritmo**: Tabla oficial de Precision Nutrition con 72 combinaciones

### Estructura de Datos
```javascript
// Perfil de usuario
{
  name: "María García",
  gender: "FEMALE",
  goal: "WEIGHT_LOSS", 
  activity: "MODERATE",
  preference: "carbohidratos"
}

// Porciones calculadas
{
  P: 4, // Proteína (palmas)
  C: 6, // Carbohidratos (puños) 
  G: 4, // Grasas (pulgares)
  V: 5  // Verduras (puños)
}

// Datos diarios
{
  date: "2024-01-15",
  portions: { P: 3, C: 5, G: 4, V: 4 },
  weight: 68.5,
  compliance: { P: 75%, C: 83%, G: 100%, V: 80% }
}
```

### Algoritmo de Precision Nutrition
La aplicación implementa la tabla oficial de PN que considera:
- **Género**: Diferencias metabólicas entre hombres y mujeres
- **Objetivo**: Pérdida de peso (-20%), mantenimiento (100%), ganancia muscular (+15%)
- **Actividad**: De sedentario a muy activo (multiplicadores 1.2 - 1.9)
- **Preferencia**: Distribución de calorías según preferencias alimentarias

### Archivos Principales

#### Páginas
- `/src/app/page.tsx` - Landing page principal
- `/src/app/login/page.tsx` - Acceso con código de usuario
- `/src/app/dashboard/page.tsx` - Calculadora personalizada
- `/src/app/dashboard/contador/page.tsx` - Contador visual de porciones
- `/src/app/dashboard/reportes/page.tsx` - Sistema de reportes
- `/src/app/entrenador/page.tsx` - Panel de control para coaches

#### Lógica
- `/src/lib/metabolismCalculator.js` - Algoritmo oficial de Precision Nutrition

#### Recursos
- `/public/icons/` - Iconos PNG para cada tipo de porción (P1-P3, C1-C3, G1-G3, V)

## ✨ Características Avanzadas

### Sistema Multi-Usuario:
- **Códigos únicos**: Cada cliente tiene un código personal
- **Aislamiento de datos**: Información completamente separada por usuario
- **Panel de entrenador**: Gestión centralizada de múltiples clientes
- **Estadísticas grupales**: Vista general de adherencia de todos los clientes

### Gráficos de Calidad Nutricional:
- **Visualización tricolor**: Verde (comer más), amarillo (ocasionalmente), rojo (comer menos)
- **Cálculo dinámico**: Porcentajes que se actualizan en tiempo real
- **Feedback motivacional**: Mensajes adaptativos según el rendimiento
- **Integración en reportes**: Calidad promedio incluida en análisis para coach

### Funciones de Edición:
- **Corrección histórica**: Editar días anteriores desde reportes
- **Objetivos personalizables**: Ajustar metas según necesidades específicas
- **Medias porciones**: Soporte para 0.5 porciones en proteína y carbohidratos

## 🎯 Beneficios del Sistema

### Para Coaches:
- **Precisión científica**: Implementa fielmente el método Precision Nutrition
- **Gestión eficiente**: Panel centralizado para múltiples clientes
- **Reportes automáticos**: Análisis de adherencia y calidad nutricional
- **Escalabilidad**: Códigos únicos permiten crecimiento sin límites
- **Ahorro de tiempo**: Cálculos automáticos eliminan trabajo manual

### Para Clientes:
- **Simplicidad**: Interfaz visual intuitiva y fácil de usar
- **Motivación**: Feedback inmediato y gráficos de progreso
- **Educación**: Aprende sobre calidad alimentaria (P1/P2/P3, etc.)
- **Flexibilidad**: Medias porciones y personalización de objetivos
- **Autonomía**: Seguimiento independiente con reportes automáticos

## Metodología Precision Nutrition

El sistema implementa fielmente el método PN que clasifica alimentos por calidad:

### Proteínas (Palmas)
- **P1**: Carnes magras, pescados, claras de huevo
- **P2**: Carnes regulares, yogur, quesos bajos en grasa
- **P3**: Carnes grasas, quesos altos en grasa

### Carbohidratos (Puños)
- **C1**: Verduras, frutas
- **C2**: Cereales integrales, legumbres
- **C3**: Cereales refinados, azúcares

### Grasas (Pulgares)
- **G1**: Aceite de oliva, aguacate, nueces
- **G2**: Mantequilla, aceites vegetales
- **G3**: Grasas trans, frituras

### Verduras (Puños)
- **V**: Cualquier vegetal (prioridad en consumo)

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre la metodología Precision Nutrition, contactar al equipo de desarrollo.

---

**Desarrollado por SaidCoach** - Sistema integral de coaching nutricional basado en evidencia científica.
