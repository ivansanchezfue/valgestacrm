
# Plan: Edicion de Tareas y Busqueda

## Resumen

Dos mejoras: (1) crear un dialogo de edicion de tareas que permita modificar todos los campos incluidas las observaciones, y (2) anadir un buscador en la pagina de tareas que filtre por titulo, descripcion o nombre de cliente.

## 1. Dialogo de Edicion de Tareas

Crear un nuevo componente `EditTaskDialog.tsx` similar al `CreateTaskDialog` pero pre-rellenado con los datos de la tarea seleccionada.

- Se abre desde el menu desplegable (DropdownMenu) de cada tarjeta de tarea con una nueva opcion "Editar"
- Permite modificar: titulo, descripcion, observaciones, prioridad, fecha limite, asignado y cliente
- Al guardar llama a `useSupabaseUpdate("tasks")` con el ID de la tarea
- Se controla con estado externo (`editTask`) para evitar problemas de cierre del dropdown

## 2. Buscador de Tareas

Anadir un campo de busqueda (Input) en la cabecera de la pagina de tareas.

- Filtra las tareas en tiempo real por titulo, descripcion, nombre del cliente vinculado o nombre del asignado
- El filtrado se aplica antes del agrupamiento por estado, de forma que las tres columnas reflejan solo las tareas que coinciden con la busqueda
- Icono de lupa decorativo dentro del input

## Seccion Tecnica

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dialogs/EditTaskDialog.tsx` | Nuevo componente: dialogo de edicion con todos los campos de la tarea |
| `src/pages/Tasks.tsx` | Anadir buscador con estado `searchQuery`, filtrar tareas antes del agrupamiento, anadir opcion "Editar" en el dropdown que abre el dialogo de edicion |

### Flujo de edicion

```text
[Click "..." en tarjeta] --> [Opcion "Editar"]
        |
        v
[setEditTask(task)] --> Abre EditTaskDialog con datos pre-rellenados
        |
        v
[Usuario modifica campos] --> [Guardar]
        |
        v
updateMutation.mutateAsync({ id, ...campos }) --> toast.success --> cerrar dialogo
```

### Logica de busqueda

```text
[Input de busqueda] --> searchQuery state
        |
        v
[Filtrar tasks]: task.title, task.description, task.observations,
                 task.assignee, clientMap[task.client_id]
        |
        v
[Agrupar filteredTasks por status] --> Renderizar columnas Kanban
```

### EditTaskDialog - Estructura

Reutiliza la misma estructura visual que `CreateTaskDialog`:
- Recibe como prop la tarea a editar y callbacks `onSave` y `onClose`
- Estado del formulario inicializado con los valores actuales de la tarea
- Boton "Guardar cambios" en lugar de "Crear Tarea"
- Se controla con `open`/`onOpenChange` externo desde `Tasks.tsx`
