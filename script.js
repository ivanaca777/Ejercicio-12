let regexN = /^[A-Za-z]\D*$/gm;
let regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

let errorNombre = document.getElementById('errorNombre');
let errorMail = document.getElementById('errorMail');
let errorFecha = document.getElementById('errorFecha');

let listadoContactos = document.getElementById('listadoContactos');

//window.onload = mostrarContactos();

class Contacto {
    constructor(nombre, mail, fecha) {
        this.nombre = nombre;
        this.mail = mail;
        this.fecha = fecha;
    }
}

//funcion generarContacto crea el contacto y luego lo sube a firebase
function generarContacto() {
    let nombre = document.getElementById('nombre').value.charAt(0).toUpperCase() + document.getElementById('nombre').value.slice(1);
    let mail = document.getElementById('mail').value
    let fecha = document.getElementById('fecha').value
      
    let contacto = null;

    if (nombre.match(regexN)) {
        if (mail.match(regexMail)) {
            if (fecha !== "") {
                contacto = new Contacto(nombre, mail, fecha)
                console.log(contacto);

                fetch('https://contactos-3a1d3-default-rtdb.firebaseio.com/contactos.json', {
                    method: 'POST',
                    body: JSON.stringify(contacto),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Contacto enviado a Firebase:', data);
                    location.reload();
                })
                .catch(error => {
                    console.error('Error al enviar el contacto a Firebase:', error);
                });
                
            }
            else {
                errorFecha.textContent = 'elija una fecha';
            }
        }
        else {
            errorMail.textContent = 'mail no válido';
        }
    }
    else {
        errorNombre.textContent = 'nombre no válido';
    }
}

let datos = {};

fetch('https://contactos-3a1d3-default-rtdb.firebaseio.com/contactos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('La solicitud no fue exitosa');
            }
            return response.json();
        })
        .then(data => {
            datos = data; // Asignar los datos a la variable datos
            let listadoContactos = document.getElementById('listadoContactos');

            listadoContactos.innerHTML = '';

            for (let i in datos) {
                if (datos.hasOwnProperty(i)) {
                    let contacto = datos[i];
                    let option = document.createElement('option');
                    option.textContent = `${contacto.nombre}`;
                    listadoContactos.appendChild(option);
                }
            }
            return datos;
        })
        .catch(error => {
            console.error('Error al recuperar datos de Firebase:', error);
        });

function mostrarDetalles() {
    let listadoContactos = document.getElementById('listadoContactos');        
    let nombreSeleccionado = listadoContactos.options[listadoContactos.selectedIndex].value;        
    let contactoSeleccionado = null;

    for (let clave in datos) {
        if (datos.hasOwnProperty(clave) && datos[clave].nombre === nombreSeleccionado) {
            contactoSeleccionado = datos[clave];
            break;
        }
    }
        
    let datosContacto = document.getElementById('datosContacto');
    if (contactoSeleccionado) {
        datosContacto.innerHTML = `
            <h2>Detalles del Contacto</h2>
            <p><strong>Nombre:</strong> ${contactoSeleccionado.nombre}</p>
            <p><strong>Mail:</strong> ${contactoSeleccionado.mail}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${contactoSeleccionado.fecha}</p>
            <button onclick="editarContacto('${nombreSeleccionado}')">Editar</button>
            <button onclick="borrarContacto('${nombreSeleccionado}')">Borrar</button>
        `;
    }
}

function borrarContacto(nombre) {
    let contactoId = null;
    for (let clave in datos) {
        if (datos.hasOwnProperty(clave) && datos[clave].nombre === nombre) {
            contactoId = clave;
            break;
        }
    }

    if (!contactoId) {
        console.error('No se encontró el contacto para borrar.');
        return;
    }

    let urlContacto = `https://contactos-3a1d3-default-rtdb.firebaseio.com/contactos/${contactoId}.json`;

    fetch(urlContacto, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo borrar el contacto.');
        }
        console.log('Contacto borrado exitosamente.');
        location.reload();
    })
    .catch(error => {
        console.error('Error al borrar el contacto:', error);
    });
}

function editarContacto(nombre) {
    let contactoId = null;
    for (let clave in datos) {
        if (datos.hasOwnProperty(clave) && datos[clave].nombre === nombre) {
            contactoId = clave;
            break;
        }
    }

    if (!contactoId) {
        console.error('No se encontró el contacto para editar.');
        return;
    }

    let contactoSeleccionado = datos[contactoId];

    let formularioEdicion = `
        <h2>Editar Contacto</h2>
        <label for="nombreEditar">Nombre:</label>
        <input type="text" id="nombreEditar" value="${contactoSeleccionado.nombre}"><br>
        <label for="mailEditar">Correo Electrónico:</label>
        <input type="email" id="mailEditar" value="${contactoSeleccionado.mail}"><br>
        <label for="fechaEditar">Fecha de Nacimiento:</label>
        <input type="date" id="fechaEditar" value="${contactoSeleccionado.fecha}"><br>
        <button onclick="guardarEdicion('${contactoId}')">Guardar</button>
    `;

    let edicion = document.getElementById('edicion');
    edicion.innerHTML = formularioEdicion;
}

function guardarEdicion(contactoId) {
    let nombreNuevo = document.getElementById('nombreEditar').value;
    let mailNuevo = document.getElementById('mailEditar').value;
    let fechaNueva = document.getElementById('fechaEditar').value;

    let urlContacto = `https://contactos-3a1d3-default-rtdb.firebaseio.com/contactos/${contactoId}.json`;
    let nuevoContacto = {
        nombre: nombreNuevo,
        mail: mailNuevo,
        fecha: fechaNueva
    };

    fetch(urlContacto, {
        method: 'PUT',
        body: JSON.stringify(nuevoContacto),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo editar el contacto.');
        }
        console.log('Contacto editado exitosamente.');

        document.getElementById('edicion').innerHTML = '';

        location.reload();
    })
    .catch(error => {
        console.error('Error al editar el contacto:', error);
    });
}

