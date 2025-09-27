# Plataforma de Profesionales - Frontend

Este proyecto está diseñado para gestionar perfiles profesionales. Permite a los profesionales crear y editar su perfil, cambiar fotos de perfil y galería, y actualizar su información personal y de servicios. Además, permite al usuario visualizar los servicios de los profesionales y comunicarse con ellos mediante Whatsapp.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **Node.js**: Descárgalo desde [nodejs.org](https://nodejs.org/).
- **Angular CLI**: Si aún no la tienes instalada, puedes instalarla globalmente con el siguiente comando:

  ```bash
  npm install -g @angular/cli

## 1) Clonar el repositorio
Primero, clona el repositorio en tu máquina local:
  
  ```bash 
   git clone https://github.com/tuusuario/tu-repositorio.git
```
```bash
   cd tu-repositorio
```
## 2) Instalar dependencias
Una vez dentro del directorio del proyecto, instala todas las dependencias necesarias con npm:
  ```bash
  npm install
  ```
## 3) Ejecutar la aplicación
Antes de ejecutar el programa asegúrate de configurar las variables necesarias en el archivo src/environments/environment.ts:
```bash
  ng serve
  ```
## 4) Acceder a la aplicación
Abre tu navegador y ve a:
  http://localhost:4200/

## Scripts de utilidad

- **Iniciar el servidor de desarrollo**: `ng serve`
- **Generar un nuevo componente**: `ng generate component nombre-del-componente`
- **Ejecutar pruebas unitarias**: `ng test`
- **Generar la build para producción**: `ng build --prod`

## API

La aplicación interactúa con la API backend para gestionar los perfiles de los profesionales. Los endpoints principales son:

- **GET** `/professionals`: Obtiene la lista de profesionales.
- **POST** `/professionals`: Crea un nuevo perfil de profesional.
- **PUT** `/professionals/{id}`: Actualiza los datos de un profesional específico.
- **DELETE** `/professionals/{id}`: Elimina un profesional.

Asegúrate de tener la API corriendo y correctamente configurada.

