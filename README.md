# OCC Export Editor

Una herramienta web profesional diseñada para visualizar y editar archivos de exportación de Oracle Commerce Cloud (OCC) con facilidad. Esta aplicación proporciona una interfaz moderna y responsiva para manejar grandes conjuntos de datos CSV, asegurando la integridad de los datos y preservando los metadatos específicos de Oracle.

## 🚀 Características Clave

- **Parseo Inteligente de CSV:** Maneja automáticamente los metadatos de OCC (ej. `/atg/commerce/catalog/...`), asegurando compatibilidad total con las importaciones/exportaciones de Oracle.
- **Interfaz Drag & Drop:** Mecanismo de carga de archivos simple con soporte para arrastrar y soltar.
- **Grid de Datos de Alto Rendimiento:**
  - **Paginación:** Maneja eficientemente archivos grandes paginando los datos (50 filas por página).
  - **Búsqueda y Filtrado:** Filtrado en tiempo real en todas las columnas.
  - **Columnas Fijas (Sticky):** La columna de acción "Eliminar" permanece fija a la izquierda para un acceso rápido.
  - **Columnas Redimensionables:** Ajusta el ancho de las columnas dinámicamente arrastrando los bordes del encabezado.
  - **Visibilidad de Columnas:** Oculta/Muestra columnas para enfocarte solo en los datos relevantes.
- **Edición de Datos:** Edición en línea de celdas CSV con actualización inmediata del estado.
- **Funcionalidad de Exportación:** Reeempaqueta los datos editados en un archivo CSV, restaurando automáticamente los encabezados de metadatos críticos de Oracle.
- **UI Moderna:** Estética profesional "Dark Mode" utilizando Tailwind CSS, con elementos de "glassmorphism" y una paleta de colores sobria.

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3**
- **JavaScript (ES6+)**
- **[Tailwind CSS](https://tailwindcss.com/)** (vía CDN) - Framework de CSS "utility-first".
- **[PapaParse](https://www.papaparse.com/)** - Potente parser de CSV para JavaScript.

## 📦 Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/adriandepool/OCC-Export-Editor.git
    ```
2.  **Abrir la aplicación:**
    Simplemente abre el archivo `index.html` en cualquier navegador web moderno. No se requiere servidor backend ni procesos de compilación.

3.  **Editar tus datos:**
    - Arrastra y suelta tu archivo `.csv` en la zona de carga.
    - Usa la barra de búsqueda para encontrar registros específicos.
    - Edita las celdas directamente haciendo clic en ellas.
    - Añade nuevas filas o elimina las existentes.
    - Usa el botón "Columnas" para ocultar/mostrar columnas.
    - Arrastra los encabezados de columna para redimensionar.

4.  **Exportar:**
    Haz clic en el botón "Exportar CSV" para descargar tu archivo modificado. La herramienta añade el prefijo `edited_` al nombre del archivo.

## host GitHub Pages

Este proyecto está diseñado para desplegarse fácilmente en **GitHub Pages**:

1.  Ve a la pestaña **Settings** de tu repositorio en GitHub.
2.  Haz clic en **Pages** en el menú de la izquierda.
3.  En **Source**, selecciona `Deploy from a branch`.
4.  En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
5.  Haz clic en **Save**.

En unos minutos, tu editor estará disponible en:
`https://adriandepool.github.io/OCC-Export-Editor/`

## 🤝 Contribuciones

¡Las contribuciones, problemas y solicitudes de nuevas características son bienvenidas!

## 📄 Licencia

[MIT](https://choosealicense.com/licenses/mit/)
