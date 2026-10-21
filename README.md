## Requisitos previos

- Git.
- Node.js compatible con la versión de Vite+ utilizada por el proyecto.
- pnpm 12.14.0, según la configuración del repositorio.

El proyecto utiliza **Vite+** como toolchain de frontend. La dependencia local `vite-plus` proporciona los comandos de desarrollo, compilación, linting, formateo y testing. No es necesario instalar globalmente la CLI `vp` para ejecutar los scripts del proyecto.

## Instalación

Clonar el repositorio e ingresar a la carpeta:

```bash
git clone https://github.com/JulianRiedinger7/proyecto-final-tup-frontend.git
cd proyecto-final-tup-frontend
```

Instalar las dependencias:

```bash
pnpm install
```

## Comandos disponibles

```bash
pnpm dev           # Servidor de desarrollo
pnpm build         # Verificación de tipos y compilación
pnpm preview       # Vista previa del build
pnpm lint          # Análisis estático del código
pnpm check         # Formateo, linting y chequeos de tipos
pnpm format        # Aplicar formato al código
pnpm format:check  # Verificar formato sin modificar archivos
pnpm test          # Ejecutar los tests
pnpm test:watch    # Ejecutar tests en modo watch
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar las variables requeridas para el entorno local. No subir el archivo `.env` al repositorio.

Las versiones de Node.js y pnpm utilizadas en el desarrollo deben respetar los requisitos declarados por las dependencias y la configuración del proyecto.
