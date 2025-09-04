
# Habitica - Tu Coach de Hábitos Gamificado

Habitica es una aplicación web diseñada para ayudarte a construir y mantener hábitos positivos de una manera divertida y motivadora. La aplicación utiliza la gamificación, asignando puntos de experiencia (XP) y rangos a medida que completas tus retos diarios, y cuenta con un coach de IA personalizado para guiarte en tu viaje.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con un stack moderno y robusto, enfocado en el rendimiento y la experiencia de desarrollo.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://reactjs.org/)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Base de Datos**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Inteligencia Artificial**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
-   **Fechas**: `date-fns`
-   **Formularios**: `react-hook-form` con `zod` para validación.

## 📁 Estructura del Proyecto

El código fuente está organizado de la siguiente manera para mantener la claridad y escalabilidad.

```
src
├── ai
│   ├── flows/            # Flujos de Genkit para la lógica de IA.
│   └── genkit.ts         # Configuración global de Genkit.
├── app
│   ├── (main)/           # Rutas principales de la aplicación.
│   │   ├── page.tsx      # Página de inicio con los retos.
│   │   └── layout.tsx    # Layout principal.
│   ├── login/            # Ruta para la página de inicio de sesión.
│   ├── globals.css       # Estilos globales y temas de ShadCN/UI.
│   └── layout.tsx        # Layout raíz de la aplicación.
├── components
│   ├── auth/             # Componentes para autenticación (formularios, botones).
│   ├── landing/          # Componentes de la página de inicio/Fan Page.
│   ├── ui/               # Componentes base de ShadCN/UI (Button, Card, etc.).
│   └── *.tsx             # Componentes específicos de la aplicación (AIChatPanel, HabitDetails, etc.).
├── hooks
│   ├── use-auth.tsx      # Hook para gestionar el estado de autenticación y datos del usuario.
│   └── use-toast.ts      # Hook para mostrar notificaciones (toasts).
├── lib
│   ├── constants.ts      # Constantes de la aplicación (rangos, hábitos iniciales).
│   ├── firebase.ts       # Inicialización y configuración de Firebase.
│   ├── types.ts          # Definiciones de tipos y esquemas de Zod.
│   └── utils.ts          # Funciones de utilidad (cálculo de rachas, etc.).
└── ...
```

## ✨ Características Principales

### 1. Autenticación de Usuarios
-   **Registro e Inicio de Sesión**: Soporte para crear cuentas con correo electrónico y contraseña.
-   **Inicio de Sesión con Google**: Integración con Firebase Authentication para un inicio de sesión rápido y seguro con cuentas de Google.
-   **Gestión de Sesión**: La sesión del usuario se mantiene activa gracias al hook `useAuth`.

### 2. Gestión de Hábitos como Retos
-   **Crear y Eliminar Retos**: Los usuarios pueden añadir nuevos retos o eliminarlos.
-   **Retos Detallados**: Cada reto tiene un nombre, categoría, descripción y una duración específica en días.

### 3. Seguimiento Diario Interactivo
-   **Calendario Visual**: Cada reto cuenta con un calendario para visualizar el progreso.
-   **Marcar Días Completados**: Los días completados se resaltan visualmente.
-   **Diario de Experiencia**: Los usuarios pueden añadir una nota de texto para cada día del reto, registrando sus pensamientos y sentimientos. Un punto en el calendario indica qué días tienen una nota.
-   **Tooltips Informativos**: Al pasar el ratón sobre un día con una nota, se muestra la experiencia escrita en una ventana flotante.

### 4. Gamificación
-   **Puntos de Experiencia (XP)**: Los usuarios ganan 1 XP por cada día de un reto que completan.
-   **Rangos**: El XP acumulado permite subir de rango, desde "Novato" hasta "Gran Maestro", cada uno con su propio icono.
-   **Rachas (Streaks)**: La aplicación calcula y muestra la racha de días consecutivos completando un hábito.

### 5. Coach de IA Conversacional
-   **Chat con IA**: Un panel de chat permite a los usuarios conversar con "Habitica", un coach de IA amigable y motivador.
-   **Sugerencias Personalizadas**: Basado en la conversación, la IA sugiere retos concretos (con nombre, categoría, descripción y duración) que el usuario puede añadir a su lista con un solo clic.

### 6. Tematización Dinámica
-   **Temas por Género**: Al registrarse, los usuarios pueden seleccionar su sexo, lo que asigna un tema de color (azul para masculino, rosa para femenino).
-   **Tema por Defecto**: Existe un tema de luz neutral para quienes no especifican o inician sesión con Google.
-   **Persistencia**: El tema se guarda en la configuración del usuario en Firestore.

## 👥 División de la Fan Page (Página de Aterrizaje)

Para facilitar la presentación y el desarrollo, la página de aterrizaje se ha dividido en los siguientes componentes modulares, cada uno asignado a un miembro del equipo:

-   **Responsable: Harry Gongora**
    -   **Componente:** `src/components/landing/HeroSection.tsx`
    -   **Descripción:** Es la sección principal de bienvenida. Contiene el título, el eslogan y el botón principal de llamada a la acción.

-   **Responsable: Josué Sinisterra**
    -   **Componente:** `src/components/landing/FeaturesSection.tsx`
    -   **Descripción:** Muestra las características clave de la aplicación (Retos, Gamificación, Coach IA) en tarjetas informativas.

-   **Responsable: Oscar Valle**
    -   **Componente:** `src/components/landing/HowItWorksSection.tsx`
    -   **Descripción:** Explica el funcionamiento de la aplicación en tres sencillos pasos, facilitando la comprensión del usuario.

-   **Responsable: Kevin Quintero**
    -   **Componentes:** `src/components/landing/CommunitySection.tsx` y `src/components/landing/CtaSection.tsx`
    -   **Descripción:** Se encarga de la sección que promueve las comunidades del foro y de la llamada a la acción final para animar al registro.

Con esto, tienes una visión completa de la arquitectura y funcionalidades del proyecto Habitica.
