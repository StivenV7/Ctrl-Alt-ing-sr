# Guía de Migración de Firebase a Supabase

Esta guía te ayudará a completar la migración de Firebase a Supabase en tu proyecto Habitica.

## 📋 Archivos Creados

He creado los siguientes archivos para facilitar la migración:

1. **`src/lib/supabase.ts`** - Configuración del cliente de Supabase
2. **`src/lib/supabase-service.ts`** - Servicios de base de datos (equivalente a firestore-service.ts)
3. **`src/hooks/use-auth-supabase.tsx`** - Hook de autenticación con Supabase
4. **`src/components/auth/LoginForm-supabase.tsx`** - Formulario de login con Supabase
5. **`src/components/auth/GoogleSignInButton-supabase.tsx`** - Botón de Google Sign-In con Supabase
6. **`.env.example`** - Plantilla para variables de entorno

## 🔧 Configuración de Supabase

### Paso 1: Crear un Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota tu **URL del proyecto** y tu **clave anónima (anon key)**

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url-del-proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### Paso 3: Crear Tablas en Supabase

Ejecuta el siguiente SQL en el Editor SQL de Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL,
  gender TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'blue', 'pink')),
  xp INTEGER DEFAULT 0,
  habits JSONB DEFAULT '[]'::jsonb,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles públicos
CREATE TABLE public_profiles (
  uid UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  rank_name TEXT NOT NULL,
  completed_habits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_public_profiles_completed_habits ON public_profiles(completed_habits DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (auth.uid() = id);

-- Políticas de seguridad para public_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own public profile" ON public_profiles
  FOR INSERT WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update their own public profile" ON public_profiles
  FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Users can delete their own public profile" ON public_profiles
  FOR DELETE USING (auth.uid() = uid);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_profiles_updated_at BEFORE UPDATE ON public_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para eliminar usuario de auth
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

### Paso 4: Configurar Autenticación con Google

1. En tu proyecto de Supabase, ve a **Authentication** > **Providers**
2. Habilita el proveedor de **Google**
3. Configura las credenciales de OAuth:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea credenciales OAuth 2.0
   - Añade la URL de callback de Supabase: `https://tu-proyecto.supabase.co/auth/v1/callback`
   - Copia el Client ID y Client Secret a Supabase

## 🔄 Reemplazar Archivos

### Paso 5: Actualizar Imports y Archivos

Reemplaza los siguientes archivos (o actualiza sus imports):

1. **`src/hooks/use-auth.tsx`**
   - Renombra el actual a `use-auth-firebase.tsx` (respaldo)
   - Renombra `use-auth-supabase.tsx` a `use-auth.tsx`

2. **`src/components/auth/LoginForm.tsx`**
   - Renombra el actual a `LoginForm-firebase.tsx` (respaldo)
   - Renombra `LoginForm-supabase.tsx` a `LoginForm.tsx`

3. **`src/components/auth/GoogleSignInButton.tsx`**
   - Renombra el actual a `GoogleSignInButton-firebase.tsx` (respaldo)
   - Renombra `GoogleSignInButton-supabase.tsx` a `GoogleSignInButton.tsx`

### Paso 6: Actualizar otros archivos que usan Firebase

Necesitarás actualizar estos archivos para que usen Supabase:

1. **`src/app/(main)/home/page.tsx`** - Actualizar operaciones de hábitos
2. **`src/app/(main)/leaderboard/page.tsx`** - Usar `getLeaderboardUsers` de supabase-service
3. **`src/app/(main)/settings/page.tsx`** - Ya está usando `useAuth`, debería funcionar

## 📊 Migración de Datos (Opcional)

Si tienes datos existentes en Firebase, necesitarás migrarlos:

1. Exporta los datos de Firestore
2. Transforma el formato (especialmente los arrays de hábitos a JSONB)
3. Importa los datos a Supabase usando el Dashboard o la API

## ✅ Verificación

Después de completar los pasos:

1. Ejecuta `npm install` para asegurar que @supabase/supabase-js está instalado
2. Ejecuta `npm run typecheck` para verificar que no hay errores de TypeScript
3. Ejecuta `npm run build` para verificar que el proyecto compila
4. Prueba la autenticación:
   - Crear cuenta nueva
   - Iniciar sesión
   - Cerrar sesión
   - Iniciar sesión con Google

## 🗑️ Limpieza (Después de verificar que todo funciona)

Una vez que hayas verificado que Supabase funciona correctamente:

1. Desinstala Firebase: `npm uninstall firebase`
2. Elimina los archivos de respaldo con sufijo `-firebase`
3. Elimina `src/lib/firebase.ts` y `src/lib/firestore-service.ts`

## 📝 Notas Importantes

- **Estructura de datos**: Los hábitos se almacenan como JSONB en Supabase en lugar de subcolecciones
- **Autenticación**: Supabase usa JWT tokens en lugar del sistema de Firebase Auth
- **RLS**: Supabase usa Row Level Security para proteger los datos
- **Realtime**: Si necesitas datos en tiempo real, Supabase ofrece subscripciones similares a Firestore

## 🆘 Soporte

Si encuentras problemas durante la migración:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Revisa los logs de Supabase en el Dashboard
3. Asegúrate de que las políticas RLS estén configuradas correctamente
