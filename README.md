# Gestion de Proyectos y Tareas

Aplicacion fullstack para administrar proyectos, tareas y un resumen general.

- Backend: .NET 8, Clean Architecture, Dapper y SQL Server.
- Frontend: Angular 19 standalone, Angular Material y NgRx.
- Base de datos: SQL Server con stored procedures.

## Requisitos

- .NET SDK 8
- Node.js 20 o superior
- npm
- SQL Server local o SQL Server en Docker
- Angular CLI opcional; tambien se puede usar `npm run start`

## Puertos y URLs

Backend:

- HTTPS: `https://localhost:59202`
- HTTP: `http://localhost:59203`
- Swagger: `https://localhost:59202/swagger`

Frontend:

- Angular dev server: `http://localhost:4200`
- API usada por el frontend en desarrollo: `https://localhost:59202/api`

No es necesario cambiar los puertos para ejecutar el proyecto. El backend acepta CORS desde `http://localhost:4200` y `http://127.0.0.1:4200`.

## Base de datos

La base se llama `GestionProyectos`.

### Opcion A: SQL Server local con Windows Authentication

Esta es la configuracion que ya viene en `backend/Src/WebApi/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=GestionProyectos;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Ejecuta los scripts en este orden:

```sql
database/init.sql
database/sp_auth.sql
database/stored_procedures.sql
```

### Opcion B: SQL Server con Docker

Levanta SQL Server:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

En ese caso cambia temporalmente `DefaultConnection` en `backend/Src/WebApi/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=GestionProyectos;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;"
}
```

Luego ejecuta los mismos scripts:

```sql
database/init.sql
database/sp_auth.sql
database/stored_procedures.sql
```

Importante: `database/init.sql` elimina y vuelve a crear la base `GestionProyectos`.

## Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| `admin@vadi.com` | `Admin123!` | Administrador |
| `colab@vadi.com` | `Admin123!` | Colaborador |
| `visual@vadi.com` | `Admin123!` | Visualizador |

## Ejecutar backend

Desde la raiz del repositorio:

```bash
dotnet restore backend/GestionProyectos.sln
dotnet build backend/GestionProyectos.sln
dotnet run --project backend/Src/WebApi/WebApi.csproj --launch-profile WebApi
```

La API queda disponible en:

```text
https://localhost:59202
```

Para revisar endpoints en Swagger:

```text
https://localhost:59202/swagger
```

Si el certificado HTTPS de desarrollo no esta confiado, ejecuta:

```bash
dotnet dev-certs https --trust
```

## Ejecutar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run start
```

Abre:

```text
http://localhost:4200
```

El frontend de desarrollo usa:

```ts
// frontend/src/environments/environment.ts
apiUrl: 'https://localhost:59202/api'
```

## Build de frontend

```bash
cd frontend
npm run build
```

El build de produccion usa `frontend/src/environments/environment.prod.ts`:

```ts
apiUrl: '/api'
```

Esto esta pensado para publicar frontend y backend bajo el mismo dominio o detras de un proxy que redirija `/api` hacia la API.

Si vas a publicar el frontend en un dominio distinto al backend, cambia `environment.prod.ts` a la URL real de la API, por ejemplo:

```ts
apiUrl: 'https://mi-api.example.com/api'
```

## Configuracion importante

### JWT

La clave JWT esta en `backend/Src/WebApi/appsettings.json`:

```json
"Jwt": {
  "Key": "CHANGE_THIS_TO_A_SECURE_32_CHAR_SECRET_KEY!!",
  "Issuer": "GestionProyectosAPI",
  "Audience": "GestionProyectosClient"
}
```

Para ejecucion local funciona como viene. Para produccion, cambia `Jwt:Key` por un secreto real y no lo subas al repositorio.

### Creador de proyectos

El frontend no envia `creadoPorId` al crear proyectos. El backend toma el usuario creador desde el JWT, usando el claim `sub`, y lo asigna en el caso de uso de creacion.

### Catalogos

Los catalogos de estados, prioridades y usuarios de prueba vienen del seed inicial.

Estados:

- `1` Pendiente
- `2` En Progreso
- `3` Completada
- `4` Cancelada

Prioridades:

- `1` Baja
- `2` Media
- `3` Alta
- `4` Critica

Usuarios asignables en la UI:

- `1` Carlos Admin
- `2` Maria Colaborador
- `3` Juan Visualizador

No hay administracion de catalogos ni usuarios porque no forma parte del alcance de la prueba.

## Flujo recomendado de prueba

1. Ejecuta la base de datos y los stored procedures.
2. Levanta el backend.
3. Levanta el frontend.
4. Inicia sesion con `admin@vadi.com`.
5. Revisa `/home` para ver resumen.
6. Entra a `/proyectos` para crear, editar o eliminar proyectos.
7. Usa el boton de tareas de un proyecto para entrar a `/proyectos/:proyectoId/tareas`.
8. Crea tareas, cambia estados y valida permisos con los usuarios colaborador y visualizador.

## Reglas de negocio implementadas

- No se puede eliminar un proyecto con tareas en estado `Pendiente` o `En Progreso`.
- No se puede completar un proyecto si tiene tareas que no estan en `Completada` o `Cancelada`.
- Al crear una tarea, el estado siempre inicia como `Pendiente`.
- No se puede completar una tarea si su proyecto esta en estado `Cancelada`.

Estas reglas se validan en backend y tambien en stored procedures.

## Comandos utiles

Backend:

```bash
dotnet build backend/GestionProyectos.sln
dotnet run --project backend/Src/WebApi/WebApi.csproj --launch-profile WebApi
```

Frontend:

```bash
cd frontend
npm install
npm run start
npm run build
```
