# ACME Macondo — Sistema de Producción

Aplicación web para la automatización del proceso productivo de la planta ACME en Macondo. Desarrollada con **HTML**, **CSS** y **JavaScript** vanilla, usando **Web Components** y persistencia híbrida con **Firebase Realtime Database** y **localStorage**.

## Ejecución del proyecto

No requiere instalación de dependencias. Opciones:

### Opción 1: Live Server (recomendado)

1. Abra la carpeta del proyecto en VS Code / Cursor.
2. Instale la extensión **Live Server**.
3. Clic derecho en `login.html` → **Open with Live Server**.

### Opción 2: Servidor HTTP simple

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Luego abra: `http://localhost:8080/login.html`

Desde el **Dashboard**, use **Cargar datos demo** para crear materia prima y la receta de galletas.

## Configuración de Firebase

1. Cree un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Active **Realtime Database** (modo de prueba o reglas personalizadas).
3. Copie la configuración en `js/config/firebase-config.js`:

```javascript
const FirebaseConfig = {
  apiKey: '...',
  databaseURL: 'https://SU-PROYECTO-default-rtdb.firebaseio.com',
  // ...
};
```

4. Estructura de nodos en Firebase:

```
/users/{identificacion}
/products/{codigo}
/productions/{codigo}
/meta/productionCounter
```

**Sin Firebase configurado**, la aplicación funciona íntegramente con **localStorage** (ideal para desarrollo local).

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Login** | Autenticación por número de identificación y contraseña |
| **Registro** | Alta de usuarios con doble validación de contraseña |
| **Usuarios** | CRUD: formulario + lista con botones U (actualizar) y D (eliminar) |
| **Inventario** | Crear productos (materia prima o terminados con fórmula) e incrementar stock por código |
| **Lista inventario** | Tabla con todos los datos, saldo y buscador |
| **Producción** | Fabricación según fórmula, código consecutivo (#1, #2…), resumen de materia prima usada |

## Estructura del proyecto

```
ACMEProject/
├── index.html
├── login.html
├── registro.html
├── dashboard.html
├── usuarios.html
├── inventario.html
├── inventarios.html
├── produccion.html
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── login.css
│   └── modules.css
├── js/
│   ├── config/firebase-config.js
│   ├── services/
│   │   ├── storage-service.js    # localStorage
│   │   ├── data-service.js       # Firebase + localStorage
│   │   └── seed-data.js
│   ├── utils/helpers.js
│   └── components/               # Web Components
│       ├── acme-navbar.js
│       ├── acme-login.js
│       ├── acme-user-register.js
│       ├── acme-user-module.js
│       ├── acme-inventory-module.js
│       ├── acme-inventory-list.js
│       └── acme-production-module.js
└── README.md
```

### Flujo UX — Módulo usuarios

```
[Nuevo] ──► Formulario vacío ──► Guardar ──► POST usuario
Lista ──► [U] ──► rellenar campos ──► Guardar ──► PUT usuario
Lista ──► [D] ──► DELETE usuario
```

## Web Components

| Componente | Uso |
|------------|-----|
| `<acme-login>` | Formulario de autenticación |
| `<acme-user-register>` | Registro con confirmación de contraseña |
| `<acme-navbar>` | Layout responsive con navegación |
| `<acme-user-module>` | CRUD de usuarios |
| `<acme-inventory-module>` | Productos + ingreso de stock |
| `<acme-inventory-list>` | Tabla con buscador |
| `<acme-production-module>` | Proceso productivo y resumen |

## Flujo productivo de ejemplo

1. Cargar datos demo (mantequilla, harina, huevo + galleta con fórmula).
2. Ir a **Producción** → código `GAL001`, cantidad `10`.
3. El sistema descuenta materia prima y aumenta stock de galletas.
4. Muestra resumen con cantidades fabricadas y materia prima consumida.
5. Asigna código consecutivo al proceso (1, 2, 3…).

## Tecnologías

- HTML5 semántico
- CSS3 (variables, Grid, Flexbox, responsive)
- JavaScript ES6+ (async/await, Custom Elements)
- Firebase Realtime Database REST API
- localStorage (sesión, caché y modo offline)

## Autor

Proyecto individual — Entrega ACME Producción JavaScript.
