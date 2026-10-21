# Estructura de `src`

- `app/`: composición de la aplicación, proveedores globales y definición de rutas.
- `assets/`: imágenes, iconos y otros recursos estáticos importados desde el código.
- `components/`: componentes compartidos; `components/ui/` queda reservado para shadcn/ui.
- `features/`: módulos por funcionalidad del producto. Cada módulo puede tener sus componentes, hooks, servicios, tipos y pruebas.
- `hooks/`: hooks compartidos entre distintas funcionalidades.
- `lib/`: utilidades compartidas, incluyendo `cn` para clases de Tailwind.
- `pages/`: componentes asociados a rutas.
- `services/`: clientes HTTP e integración con APIs externas.
- `test/`: configuración compartida de pruebas. Colocar las pruebas junto a sus componentes como `*.test.tsx`.
- `types/`: tipos compartidos que no pertenecen a una funcionalidad concreta.

Mantener cerca del código los módulos que cambian juntos. Si un componente solo se usa en una funcionalidad, ubicarlo dentro de `features/<nombre>/` en lugar de hacerlo global.
