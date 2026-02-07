# 🎲 Magic Dice App

Una aplicación **Expo + React Native** que combina un juego de dado interactivo basado en acelerómetro con una función de constructor 3D de hamburguesas. La arquitectura sigue patrones **DDD (Domain-Driven Design)** y **Atomic Design** para máxima mantenibilidad y escalabilidad.


## ✨ Características

### 🎲 Magic Dice
- Dado 3D con **sensor de acelerómetro** del dispositivo
- Agita para lanzar automáticamente
- Retroalimentación háptica al lanzar
- Visualización en tiempo real de datos del acelerómetro
- Animaciones suaves con **React Native Reanimated**

### 🍔 Constructor de Hamburguesa
- Visualización 3D con **React Three Fiber** y **Drei**
- **Ingredientes ilimitados**: añade múltiples unidades del mismo ingrediente
- **Reordenación visual**: mueve ingredientes arriba/abajo en la hamburguesa
- Dos modos de visualización:
  - **Single Canvas**: toda la hamburguesa en una sola vista con cámara dinámica
  - **Separate Layers**: cada capa en su propio canvas con iluminación automática
- Carrito de compra con cálculo automático de precios
- Flujo completo: Builder → Checkout → Success

---

## 🏗️ Arquitectura

### Domain-Driven Design (DDD)

La aplicación divide la lógica en capas claramente separadas:

#### **`lib/core/domain/`** - El Corazón del Negocio
Contiene las entidades, tipos y servicios de dominio **agnósticos a cualquier framework**.

**Archivos clave:**

- **`dice.types.ts`**: Tipos base del dado (DiceFace, Vector3D, DiceState, DiceGameEvent)
- **`dice.service.ts`**: Servicios puros de dominio:
  - `Physics3D`: cálculos vectoriales (LERP, aplicar fricción, magnitud)
  - `DiceLogic`: lógica del juego (validación, rolls aleatorios, negligencia de velocidad)
- **`dice.usecases.ts`**: Casos de uso orquestados:
  - `startRoll()`: inicia una tirada
  - `applyMotion()`: aplica datos del acelerómetro a velocidad
  - `updateRotation()`: actualiza rotación y aplica física
  - `stopRoll()`: detiene la rotación
- **`hamburger.types.ts`**: Tipos y lógica de hamburguesa:
  - `HamburgerIngredient`: tipos de ingredientes (queso, pepinillos, lechuga, carne)
  - `HAMBURGER_INGREDIENTS`: config con precios
  - `calculateHamburgerPrice()`: función pura de cálculo
  - `HamburgerOrder`: tipo de orden


#### **`lib/core/logic/`** - Utilidades Vectoriales
Funciones de cálculo independientes:
- **`motion.ts`**: `magnitude()`, `isShaking()` - detección de movimiento
- **`constants.ts`**: umbrales y configuración física (SHAKE_THRESHOLD, ACCEL_UPDATE_INTERVAL_MS, SHAKE_COOLDOWN_MS)

#### **`lib/modules/sensors/`** - Adaptadores de Infraestructura
Encapsula la dependencia de **expo-sensors** (hardware):

- **`accelerometer/accelerometer.service.ts`**: 
  - `SensorService.subscribe()` / `.unsubscribe()`
  - Controla el intervalo de actualización del acelerómetro
  - Aísla la complejidad del hardware
  
- **`accelerometer/useAccelerometer.ts`**: Hook adaptador que:
  - Suscribe al servicio de sensores
  - Convierte datos de hardware a tipos de dominio (`Vector3D`)
  - Detecta movimiento usando lógica de dominio
  - **Inyecta el callback `onShake()` del usuario**

**Patrón:** Infrastructure Layer → Adapter Hooks → Use Cases (Domain)

---

### Atomic Design

La presentación sigue **Atomic Design** para componentes **reutilizables y componibles**:

#### **`components/atoms/`** - Elementos Básicos
Unidades más pequeñas y reutilizables:

- **`Button.tsx`**: Botón versátil
  - Props: `onPress`, `children`, `variant` (primary/secondary), `disabled`
  - **Robusto para React Native**: detecta nodos "solo texto" (incluyendo arrays/fragments) y los envuelve automáticamente en `<Text>` para evitar crash de RN
  - Soporta iconos de lucide-react-native dentro del contenido
  
- **`DiceDisplay.tsx`**: Muestra el número del dado
  - Props: `value` (1-6), `isRolling`
  - Animaciones con Reanimated

#### **`components/molecules/`** - Componentes Compuestos
Combinaciones de átomos:

- **`SensorInfo.tsx`**: Panel de información de acelerómetro
  - Muestra estado (agitando/en reposo) con indicador animado
  - Datos en tiempo real (X, Y, Z)
  
- **`DiceCard.tsx`**: Tarjeta que agrupa título + 3D + botón
  - Combina: icono (lucide) + texto + Dice3D organism + Button atom

#### **`components/organisms/`** - Componentes Complejos
Composiciones avanzadas que orquestan moléculas y átomos:

- **`Dice3D.tsx`**: Render 3D del dado con R3F
  - Props: `value` (cara actual), `isRolling`, `isIdle`, `motionData` (del acelerómetro)
  - Carga GLB con `useGLTF`
  - `useFrame` para actualizar rotación según física
  - Tres modos: idle (rotación constante), rolling (rotación loca), static (cara final)
  
- **`Hamburger3D.tsx`**: Wrapper que orquesta render 3D de hamburguesa
  - Props: `layout` (single/separate), `selectedIngredients`
  - **No es un "god component"**: delega el render real a subcomponentes
  - Construye capas desde `HAMBURGER_INGREDIENTS` y pasa a:
    - `HamburgerLayerCanvas` (modo separate)
    - `HamburgerSingleCanvas` (modo single)

- **`hamburger/HamburgerModel.tsx`**: Carga y normaliza modelos GLB
  - Función pura de carga con `useGLTF`
  - **Clonado de escena**: usa `SkeletonUtils.clone()` para evitar conflictos al renderizar en múltiples canvases
  - **Normalización de shading**: ajusta normales y propiedades de materiales
  - **Recentrado**: Corrige pivots descentrados (ej. pepinillos) usando bounding box X/Z
  
- **`hamburger/HamburgerLayerCanvas.tsx`**: Canvas por capa (modo separate)
  - Usa `<Stage preset="rembrandt">` para iluminación/cámara automática
  - Altura fija (220px), útil para galerías desplazables
  
- **`hamburger/HamburgerSingleCanvas.tsx`**: Canvas único (modo single)
  - **Cámara dinámica**: ajusta Z y Y según altura real de la pila de capas
  - `computeExplodedPositions()`: calcula espaciado vertical adaptativo
  - FOV reducido (32) para perspectiva más "cerrada"
  - Soporta ingredientes duplicados sin conflictos

---

### Estructura de Carpetas

```
dice-app/
├── app/                              # Rutas Expo Router (presentación)
│   ├── _layout.tsx                  # Stack root
│   ├── index.tsx                    # Pantalla inicio (menú)
│   └── games/
│       ├── _layout.tsx              # Stack games
│       ├── dice.tsx                 # Pantalla juego de dado
│       ├── hamburger.tsx            # Pantalla visualización hamburguesa
│       ├── hamburger-builder.tsx    # Constructor (+ ingredientes ilimitados)
│       ├── hamburger-checkout.tsx   # Resumen de compra
│       └── hamburger-success.tsx    # Confirmación de orden
│
├── components/                       # Presentación (Atomic Design)
│   ├── atoms/
│   │   ├── Button.tsx               # Botón robusto (RN-safe)
│   │   └── DiceDisplay.tsx          # Número del dado animado
│   ├── molecules/
│   │   ├── SensorInfo.tsx           # Panel acelerómetro
│   │   └── DiceCard.tsx             # Tarjeta dado
│   └── organisms/
│       ├── Dice3D.tsx               # Dado 3D (R3F)
│       ├── DiceCard.tsx             # (deprecado, usar molecules)
│       ├── Hamburger3D.tsx          # Orquestador hamburguesa
│       └── hamburger/
│           ├── HamburgerModel.tsx       # Carga + normaliza GLB
│           ├── HamburgerLayerCanvas.tsx # Canvas por capa
│           └── HamburgerSingleCanvas.tsx# Canvas único (dinámico)
│
├── lib/                              # Lógica (Backend-agnostic)
│   ├── index.ts                     # Barrel exports
│   ├── core/
│   │   ├── domain/                  # DDD: Entidades y servicios puros
│   │   │   ├── dice.types.ts
│   │   │   ├── dice.service.ts
│   │   │   ├── dice.usecases.ts
│   │   │   ├── hamburger.types.ts
│   │   │   └── index.ts
│   │   └── logic/                   # Cálculos vectoriales
│   │       ├── motion.ts
│   │       ├── constants.ts
│   │       └── index.ts
│   └── modules/                     # Infraestructura: adaptadores
│       └── sensors/
│           └── accelerometer/
│               ├── accelerometer.service.ts   # Envuelve expo-sensors
│               ├── useAccelerometer.ts        # Hook adaptador
│               └── index.ts
│
├── assets/
│   └── images/
│       ├── Dice.glb
│       ├── Hamburguesa/ (pepinillos.glb, carne.glb, ...)
│       └── vergil-hamburguer.png   # Icono app
│
├── app.json                         # Config Expo
├── tsconfig.json                    # TypeScript estricto (strict: true)
├── package.json
└── README.md                        # (este archivo)
```

---

## 🛠️ Tecnologías

### Core
- **Expo 54** + **React Native 0.83**
- **TypeScript 5.9** (modo strict)
- **Expo Router** para navegación file-based

### Sensores & Movimiento
- **expo-sensors** (Accelerometer)
- **expo-haptics** (retroalimentación táctil)
- **react-native-reanimated** (animaciones suaves)

### 3D & Gráficos
- **@react-three/fiber** (R3F, React para Three.js)
- **@react-three/drei** (utilidades: useGLTF, Stage, etc.)
- **three** + **three-stdlib** (clonado con SkeletonUtils)
- **expo-gl** (contexto GL para R3F en RN)

### UI & Iconografía
- **lucide-react-native** (iconografía vectorial, sin emojis)
- **StyleSheet** de React Native (estilos locales)

### Herramientas
- **ESLint + expo** (linting)
- **Vite** (dev server web)
## 🎨 Componentes Principales

### Magic Dice (`app/games/dice.tsx`)

**Flujo:**
1. Usuario llega a pantalla de dado
2. Hook `useAccelerometer()` se suscribe a sensores
3. Acelerómetro detecta **shake** → lanza dado automáticamente
4. `DiceUseCases.startRoll()` genera número aleatorio
5. `Dice3D` recibe `isRolling=true` → rotación loca
6. Después de 3 segundos sin movimiento, se estabiliza en la cara ganadora

**Componentes usados:**
- `DiceCard` (molecules) → agrupa UI
- `Dice3D` (organisms) → render en R3F
- `Button` (atoms) → botón manual
- `useAccelerometer()` hook → suscripción sensores

---

### Constructor de Hamburguesa (`app/games/hamburger-builder.tsx`)

**Flujo:**
1. Usuario ve menú de ingredientes (4 tipos: queso, pepinillos, lechuga, carne)
2. Toca ingrediente → se suma a array (puede repetir ilimitadas veces)
3. Contador por ingrediente muestra cantidad
4. Botones ±/chevron para añadir, quitar, reordenar
5. `Hamburger3D` renderiza capas en tiempo real
6. Canvas crece dinámicamente según número de capas
7. Botón "Comprar" → navega a checkout

**Características destacadas:**
- **Ingredientes ilimitados**: `selectedIngredients` es array con duplicados
- **Orden vertical**: lista de arriba → abajo (Pan > Ing1 > Ing2 > ... > Pan)
- **Cámara adaptativa**: ajusta Z/Y y FOV según altura de la pila
- **Recentrado de modelos**: pepinillos y otros con pivot corrido se centran automáticamente

---

### Checkout & Success (`hamburger-checkout.tsx`, `hamburger-success.tsx`)

- **Checkout**: resumen 3D + desglose de precios + confirmación
- **Success**: confirmación animada (icono escala con spring), total pagado, opciones para repetir

---

## 🚀 Flujos de Usuario

### Flujo 1: Jugar al Dado
```
Home → [Botón "Jugar al Dado"] 
→ Dice Screen 
→ Agita dispositivo 
→ Dado gira → Cara resultado 
→ [Volver al Inicio]
```

### Flujo 2: Construir Hamburguesa
```
Home → [Botón "Construir Hamburguesa"]
→ Builder Screen
  → Añade ingredientes (ej: 30 carnes)
  → Visualiza en 3D
  → Reordena capas
  → [Comprar]
→ Checkout Screen
  → Revisa resumen
  → [Confirmar Compra]
→ Success Screen
  → Ve confirmación
  → [Repetir] o [Volver a Inicio]
```

### Flujo 3: Visualizar Hamburguesa (solo lectura)
```
Home → [Botón "Ver Hamburguesa"]
→ Hamburger Screen
  → [Toggle "Ver en una sola escena" ↔ "Ver por capas"]
  → Visualiza hamburguesa predefinida
  → [Construir mi Hamburguesa] → Builder Screen
```

---

## 🔍 Decisiones Arquitectónicas

### 1. **DDD para Lógica de Negocio**
- La física del dado y cálculos de precios viven en `lib/core/domain`, **sin dependencias de React o RN**
- Facilita testing unitario y reutilización en otras plataformas
- Casos de uso orquestados en `DiceUseCases` y funciones puras en servicios

### 2. **Infraestructura como Adaptadores**
- `accelerometer.service.ts` encapsula `expo-sensors`
- `useAccelerometer()` es un adapter hook que convierte datos de hardware a tipos de dominio
- Si en futuro se cambia el proveedor de sensores, solo se actualiza el servicio

### 3. **Atomic Design sin God Components**
- **Atoms**: elementos básicos (Button, DiceDisplay)
- **Molecules**: composiciones simples (SensorInfo, DiceCard)
- **Organisms**: componentes complejos que delegan (Hamburger3D → subcomponentes)
- `Hamburger3D` **no renderiza directamente GLB**, delega a `HamburgerModel` + canvases

Regla práctica usada en el proyecto:
- Las pantallas en `app/` pueden orquestar UI/estado/navegación (son “feature screens”).
- La lógica reutilizable (3D, sensores, UI genérica) vive en `components/` y `lib/`.
- Si un archivo empieza a mezclar demasiadas responsabilidades (render 3D + reglas de negocio + navegación + mapeo de assets), se parte en atoms/molecules/organisms o en módulos de `lib/`.

### 4. **Clonado de Escenas GLB**
- Los modelos `.glb` se cargan con `useGLTF()` y se **clonan** en cada renderización
- Esto evita conflictos cuando el mismo `Object3D` de Three.js se intenta renderizar en múltiples canvases simultáneamente
- `SkeletonUtils.clone()` preserva la estructura, materiales y animaciones

### 5. **Cámara Dinámica para Múltiples Ingredientes**
- `HamburgerSingleCanvas` calcula posiciones Y en forma de "explosión" vertical
- El span total determina distancia Z y Y de la cámara
- Esto hace que, sin importar si hay 2 o 30 capas, la visualización siempre sea adecuada

### 6. **Robustez en React Native**
- `Button.tsx` detecta si `children` es "solo texto" (incluyendo arrays de strings o fragments) y lo envuelve en `<Text>`
- Permite composición flexible sin romper la regla de RN

### 7. **Sin `any` en Tipos**
- El código de la app evita `any` (búsqueda global en `*.ts/tsx`)
- Para compatibilidad con librerías (p.ej. `useGLTF` en RN/Expo) se usa `unknown` + casts controlados
- En assets 3D se usa `GlbAsset = number | string` (RN suele devolver un id numérico; web puede usar URL)
- TypeScript corre en modo estricto (`strict: true`)

---

## 📝 Notas Adicionales

### Ubicación de Activos 3D
```
assets/
└── images/
    ├── Dice.glb
    └── Hamburguesa/
        ├── pansuperior.glb
        ├── paninferior.glb
        ├── queso.glb
        ├── pepinillos.glb
        ├── leshuga.glb       
        └── carne.glb
```

### Configuración Physical (Physics)
En `lib/core/logic/constants.ts`:
- `SHAKE_THRESHOLD = 1.78` (magnitud de aceleración para detectar shake)
- `ACCEL_UPDATE_INTERVAL_MS = 100` (frecuencia de lectura del acelerómetro)
- `SHAKE_COOLDOWN_MS = 600` (tiempo mínimo entre detecciones consecutivas)



