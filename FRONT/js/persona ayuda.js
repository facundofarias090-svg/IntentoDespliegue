// URL base de la API del backend que administra las personas.
const apiPersonas = "http://localhost:5046/api/Persona";
// Colección local con las personas cargadas; se usa para mostrar y validar datos.
let personas = [];

// Solicita a la API la lista de personas y actualiza el listado de la página.
function obtenerPersonas() {
  // Inicia una petición HTTP GET a la URL base de personas.
  fetch(apiPersonas)
    // Revisa si el servidor respondió con un estado HTTP exitoso.
    .then((respuesta) => {
      // Si la respuesta indica error, lo transforma en una excepción.
      if (!respuesta.ok) {
        // Incluye el código HTTP para facilitar el diagnóstico.
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      // Convierte el cuerpo de la respuesta desde JSON a datos JavaScript.
      return respuesta.json();
    })
    // Recibe los datos convertidos desde JSON.
    .then((data) => {
      // Guarda la lista recibida para reutilizarla en otras operaciones.
      personas = data;
      // Dibuja las personas en la tabla de la página.
      mostrarPersonas(data);
    })
    // Atiende errores de red, HTTP o conversión de la respuesta.
    .catch((error) => {
      // Registra el error con contexto en la consola del navegador.
      console.error("No se pudo acceder a la API de personas:", error);
      // Informa al usuario que no se pudo cargar la lista.
      alert("No se pudieron cargar las personas. Verificá que la API esté disponible.");
    });
}

// Construye las filas de la tabla a partir de una lista de personas.
function mostrarPersonas(data) {
  // Busca en el documento el cuerpo de la tabla donde se insertarán las filas.
  const tbody = document.getElementById("tablaPersonas");
  // Si la tabla no existe en esta página, no hay nada que representar.
  if (!tbody) return;

  // Elimina las filas anteriores antes de representar la lista actualizada.
  tbody.innerHTML = "";

  // Recorre cada persona recibida para crear una fila con sus datos y acciones.
  data.forEach((element) => {
    // Inserta una nueva fila al final del cuerpo de la tabla.
    const tr = tbody.insertRow();
    // Agrega el nombre de la persona en la primera celda.
    tr.insertCell(0).textContent = element.nombre;
    // Agrega el apellido de la persona en la segunda celda.
    tr.insertCell(1).textContent = element.apellido;
    // Agrega el documento de la persona en la tercera celda.
    tr.insertCell(2).textContent = element.documento;

    // Crea el botón para consultar la información completa.
    const consultar = document.createElement("button");
    // Define el texto visible del botón de consulta.
    consultar.textContent = "Consultar";
    // Aplica las clases CSS compartidas para el estilo del botón.
    consultar.classList.add("button", "button-secondary");
    // Evita que el botón actúe como botón de envío de un formulario.
    consultar.type = "button";
    // Asigna la acción que se ejecuta al hacer clic en consultar.
    consultar.onclick = function () {
      // Pide al backend los detalles de la persona seleccionada.
      ConsultarPersona(element.personaID);
    };

    // Crea el botón para editar los datos de la persona.
    const editar = document.createElement("button");
    // Define el texto visible del botón de edición.
    editar.textContent = "Editar";
    // Aplica las clases CSS compartidas para el estilo del botón.
    editar.classList.add("button", "button-secondary");
    // Evita que el botón actúe como botón de envío de un formulario.
    editar.type = "button";
    // Asigna la acción que se ejecuta al hacer clic en editar.
    editar.onclick = function () {
      // Busca los datos de la persona y los carga en el formulario de edición.
      BuscarValoresPersonas(element.personaID);
    };

    // Crea el botón para eliminar a la persona.
    const eliminar = document.createElement("button");
    // Define el texto visible del botón de eliminación.
    eliminar.textContent = "Eliminar";
    // Aplica las clases CSS compartidas para el estilo del botón.
    eliminar.classList.add("button", "button-secondary");
    // Evita que el botón actúe como botón de envío de un formulario.
    eliminar.type = "button";
    // Asigna la acción que se ejecuta al hacer clic en eliminar.
    eliminar.onclick = function () {
      // Solicita confirmación antes de iniciar la eliminación.
      ValidacionEliminarPersona(element.personaID);
    };

    // Agrega una cuarta celda a la fila para ubicar los botones de acción.
    const celdaAcciones = tr.insertCell(3);
    // Aplica la clase CSS que organiza visualmente los botones.
    celdaAcciones.classList.add("directory-actions");
    // Agrega el botón de consulta a la celda de acciones.
    celdaAcciones.appendChild(consultar);
    // Agrega el botón de edición a la celda de acciones.
    celdaAcciones.appendChild(editar);
    // Agrega el botón de eliminación a la celda de acciones.
    celdaAcciones.appendChild(eliminar);
  });
}

// Valida los campos del formulario y comprueba que el documento no esté duplicado.
// Recibe el formulario y, al editar, el identificador de la persona actual.
function validarFormularioPersona(formulario, personaId = null) {
  // Obtiene todos los campos de texto del formulario recibido.
  const camposTexto = formulario.querySelectorAll('input[type="text"]');

  // Comprueba uno por uno que los campos de texto tengan contenido no vacío.
  camposTexto.forEach((campo) => {
    // Establece el mensaje de validación nativo según el valor recortado.
    campo.setCustomValidity(
      // Cadena vacía indica válido; de lo contrario se muestra este mensaje.
      campo.value.trim() ? "" : "Este campo no puede estar vacío.",
    );
  });

  // Obtiene el campo del documento usando el atributo name.
  const documento = formulario.querySelector('[name="Documento"]');
  // Elimina espacios extremos y normaliza mayúsculas/minúsculas para comparar.
  const documentoNormalizado = documento.value.trim().toLocaleLowerCase();
  // Comprueba si otra persona ya tiene el documento ingresado.
  const documentoDuplicado = personas.some(
    // Compara documentos normalizados y excluye la persona que se está editando.
    (persona) =>
      String(persona.documento).trim().toLocaleLowerCase() ===
        documentoNormalizado &&
      Number(persona.personaID) !== Number(personaId),
  );

  // Marca el documento como inválido si pertenece a otra persona.
  documento.setCustomValidity(
    // Muestra el aviso de duplicado o limpia cualquier error anterior.
    documentoDuplicado ? "Ya existe una persona con ese documento." : "",
  );

  // Obtiene el campo de salario del formulario.
  const salario = formulario.querySelector('[name="Salario"]');
  // Convierte el contenido del campo a número para poder validarlo.
  const valorSalario = Number(salario.value);
  // Rechaza valores vacíos, no numéricos o negativos.
  salario.setCustomValidity(
    // El salario válido debe ser un número finito mayor o igual que cero.
    salario.value === "" || !Number.isFinite(valorSalario) || valorSalario < 0
      ? "El salario debe ser un número mayor o igual a 0."
      : "",
  );

  // Ejecuta la validación nativa y devuelve si el formulario es válido.
  return formulario.reportValidity();
}

// Recoge los datos del formulario de alta y envía una nueva persona a la API.
function AgregarPersona() {
  // Construye el objeto con los nombres de propiedades que espera el backend.
  const nuevaPersona = {
    // Lee el nombre y elimina espacios sobrantes al inicio y al final.
    nombre: document.getElementById("Nombre").value.trim(),
    // Lee el apellido y elimina espacios sobrantes al inicio y al final.
    apellido: document.getElementById("Apellido").value.trim(),
    // Lee el documento y elimina espacios sobrantes al inicio y al final.
    documento: document.getElementById("Documento").value.trim(),
    // Lee la fecha de nacimiento tal como la proporciona el campo del formulario.
    fechaNacimiento: document.getElementById("FechaNacimiento").value,
    // Lee la dirección y elimina espacios sobrantes al inicio y al final.
    direccion: document.getElementById("Direccion").value.trim(),
    // Convierte el salario ingresado a un número decimal.
    salario: parseFloat(document.getElementById("Salario").value),
  };

  // Envía la nueva persona mediante una petición HTTP POST.
  fetch(apiPersonas, {
    // Indica que la operación crea un nuevo recurso.
    method: "POST",
    // Declara que la petición envía y acepta datos en formato JSON.
    headers: {
      // Indica que la respuesta esperada puede ser JSON.
      Accept: "application/json",
      // Indica que el cuerpo de la petición está codificado como JSON.
      "Content-Type": "application/json",
    },
    // Convierte el objeto de la persona a texto JSON para enviarlo en el cuerpo.
    body: JSON.stringify(nuevaPersona),
  })
    // Comprueba el estado de la respuesta y procesa su contenido.
    .then((respuesta) => procesarRespuesta(respuesta))
    // Si la creación fue exitosa, limpia el formulario y actualiza la tabla.
    .then(() => {
      // Restablece los campos del formulario de alta a sus valores iniciales.
      document.getElementById("persona-form").reset();
      // Vuelve a consultar la API para mostrar la lista actualizada.
      obtenerPersonas();
    })
    // Maneja errores de red o respuestas HTTP fallidas.
    .catch((error) => {
      // Registra el error en la consola con el contexto de la operación.
      console.error("No se pudo crear la persona:", error);
      // Muestra el error recibido o un mensaje general al usuario.
      alert(error.message || "No se pudo crear la persona.");
    });
}

// Consulta en la API los datos detallados de una persona por su identificador.
function ConsultarPersona(id) {
  // Construye la URL del recurso individual y solicita sus datos.
  fetch(`${apiPersonas}/${id}`)
    // Valida el estado HTTP antes de interpretar el cuerpo.
    .then((respuesta) => {
      // Convierte las respuestas no exitosas en errores.
      if (!respuesta.ok) {
        // Incluye el código de estado de la respuesta en el error.
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      // Convierte el cuerpo JSON en el objeto de la persona.
      return respuesta.json();
    })
    // Usa los datos recibidos para completar y abrir la vista de detalle.
    .then((persona) => {
      // Muestra nombre y apellido juntos en el campo de detalle.
      document.getElementById("detalleNombre").textContent =
        `${persona.nombre} ${persona.apellido}`;
      // Muestra el documento de la persona.
      document.getElementById("detalleDocumento").textContent =
        persona.documento;
      // Muestra la fecha ya formateada por el backend.
      document.getElementById("detalleFechaNacimiento").textContent =
        persona.fechaFormateada;
      // Muestra la dirección de la persona.
      document.getElementById("detalleDireccion").textContent =
        persona.direccion;
      // Muestra el salario como texto y quita ceros decimales finales.
      document.getElementById("detalleSalario").textContent =
        String(persona.salario).replace(/([,.])0+$/, "");
      // Cierra el modal de edición si estaba abierto.
      document.getElementById("edit-modal-toggle").checked = false;
      // Abre el modal con los datos detallados.
      document.getElementById("detail-modal-toggle").checked = true;
    })
    // Maneja errores de red, HTTP o lectura de los datos de detalle.
    .catch((error) => {
      // Registra el error en la consola del navegador.
      console.error("No se pudieron consultar los datos de la persona:", error);
      // Informa al usuario que no fue posible obtener los datos.
      alert("No se pudieron consultar los datos de la persona.");
    });
}

// Busca una persona en la lista cargada y completa el formulario de edición.
function BuscarValoresPersonas(id) {
  // Encuentra el primer registro cuyo identificador coincida con el solicitado.
  const persona = personas.find((element) => element.personaID === id);

  // Si el registro no está en la lista local, avisa y detiene la operación.
  if (!persona) {
    // Pide actualizar el listado para volver a intentar con datos actuales.
    alert("No se encontró la persona seleccionada. Actualizá el listado e intentá nuevamente.");
    // Evita intentar cargar campos usando un registro inexistente.
    return;
  }

  // Carga el identificador en el campo oculto del formulario de edición.
  document.getElementById("editarPersonaID").value = persona.personaID;
  // Carga el nombre actual en el formulario de edición.
  document.getElementById("editarNombre").value = persona.nombre;
  // Carga el apellido actual en el formulario de edición.
  document.getElementById("editarApellido").value = persona.apellido;
  // Carga el documento actual en el formulario de edición.
  document.getElementById("editarDocumento").value = persona.documento;
  // Convierte la fecha DD/MM/AAAA al formato AAAA-MM-DD requerido por input date.
  document.getElementById("editarFechaNacimiento").value =
    persona.fechaFormateada.split("/").reverse().join("-");
  // Carga la dirección actual en el formulario de edición.
  document.getElementById("editarDireccion").value = persona.direccion;
  // Convierte una coma decimal a punto para que el campo numérico la interprete.
  document.getElementById("editarSalario").value = String(persona.salario).replace(",", ".");
  // Cierra el modal de detalle si estaba abierto.
  document.getElementById("detail-modal-toggle").checked = false;
  // Abre el modal de edición.
  document.getElementById("edit-modal-toggle").checked = true;
}

// Recoge los cambios del formulario de edición y los envía a la API.
function EditarPersona() {
  // Obtiene el identificador de la persona desde el campo del formulario.
  const id = document.getElementById("editarPersonaID").value;
  // Construye el objeto actualizado con los valores editados.
  const editarPersona = {
    // Convierte el identificador de texto a entero.
    personaID: parseInt(id),
    // Obtiene el nombre editado y recorta espacios extremos.
    nombre: document.getElementById("editarNombre").value.trim(),
    // Obtiene el apellido editado y recorta espacios extremos.
    apellido: document.getElementById("editarApellido").value.trim(),
    // Obtiene el documento editado y recorta espacios extremos.
    documento: document.getElementById("editarDocumento").value.trim(),
    // Obtiene la fecha de nacimiento desde su campo de entrada.
    fechaNacimiento: document.getElementById("editarFechaNacimiento").value,
    // Obtiene la dirección editada y recorta espacios extremos.
    direccion: document.getElementById("editarDireccion").value.trim(),
    // Convierte el salario editado a un número decimal.
    salario: parseFloat(document.getElementById("editarSalario").value),
  };

  // Envía los datos actualizados al recurso identificado mediante HTTP PUT.
  fetch(`${apiPersonas}/${id}`, {
    // Indica que se actualizará el recurso existente.
    method: "PUT",
    // Declara que la petición envía y acepta datos en formato JSON.
    headers: {
      // Indica que la respuesta esperada puede ser JSON.
      Accept: "application/json",
      // Indica que el cuerpo de la petición está codificado como JSON.
      "Content-Type": "application/json",
    },
    // Serializa el objeto actualizado para incluirlo en el cuerpo de la petición.
    body: JSON.stringify(editarPersona),
  })
    // Comprueba el resultado HTTP usando el procesador común de respuestas.
    .then((respuesta) => procesarRespuesta(respuesta))
    // Al completar la actualización, limpia el formulario y refresca la lista.
    .then(() => {
      // Restablece los campos del formulario de edición.
      document.getElementById("editar-persona-form").reset();
      // Cierra el modal de edición.
      document.getElementById("edit-modal-toggle").checked = false;
      // Vuelve a cargar las personas para mostrar los cambios.
      obtenerPersonas();
    })
    // Atiende errores de red o respuestas HTTP fallidas.
    .catch((error) => {
      // Registra el error en la consola con el contexto de la operación.
      console.error("No se pudo editar la persona:", error);
      // Muestra el detalle del error o un mensaje general al usuario.
      alert(error.message || "No se pudo editar la persona.");
    });
}

// Solicita confirmación al usuario antes de borrar una persona.
function ValidacionEliminarPersona(id) {
  // Muestra un diálogo nativo y guarda si el usuario aceptó.
  const siElimina = confirm("¿Está seguro de eliminar esta persona?");
  // Solo continúa con la eliminación si hubo confirmación.
  if (siElimina) {
    // Inicia la petición para borrar el registro seleccionado.
    EliminarPersona(id);
  }
}

// Elimina de la API a la persona identificada y actualiza el listado.
function EliminarPersona(id) {
  // Envía una petición HTTP DELETE al recurso individual.
  fetch(`${apiPersonas}/${id}`, {
    // Indica que se solicita eliminar el recurso.
    method: "DELETE",
  })
    // Comprueba el resultado HTTP usando el procesador común de respuestas.
    .then((respuesta) => procesarRespuesta(respuesta))
    // Cuando la eliminación tiene éxito, vuelve a consultar la lista.
    .then(() => {
      // Actualiza la tabla para que ya no muestre la persona eliminada.
      obtenerPersonas();
    })
    // Atiende errores de red o respuestas HTTP fallidas.
    .catch((error) => {
      // Registra el error con el contexto de la operación.
      console.error("No se pudo eliminar la persona:", error);
      // Muestra el detalle del error o un mensaje general al usuario.
      alert(error.message || "No se pudo eliminar la persona.");
    });
}

// Lee el cuerpo de una respuesta HTTP y genera un error si el estado no fue exitoso.
function procesarRespuesta(respuesta) {
  // Lee el contenido como texto, incluso si el servidor no devuelve contenido.
  return respuesta.text().then((mensaje) => {
    // Detecta estados HTTP fallidos.
    if (!respuesta.ok) {
      // Usa el mensaje del servidor o, si está vacío, el código HTTP.
      throw new Error(mensaje || `Error HTTP: ${respuesta.status}`);
    }

    // Devuelve el texto de una respuesta exitosa al siguiente paso de la cadena.
    return mensaje;
  });
}

// Obtiene el formulario de alta del documento.
const formularioPersona = document.getElementById("persona-form");
// Registra la lógica que se ejecuta al intentar enviar el formulario de alta.
formularioPersona.addEventListener("submit", (event) => {
  // Evita que el navegador recargue la página al enviar el formulario.
  event.preventDefault();

  // Valida los datos antes de hacer una petición al backend.
  if (!validarFormularioPersona(formularioPersona)) {
    // Detiene el envío cuando hay errores de validación.
    return;
  }

  // Envía los datos validados para crear la persona.
  AgregarPersona();
});

// Obtiene el formulario utilizado para editar una persona existente.
const formularioEditarPersona = document.getElementById(
  "editar-persona-form",
);
// Registra la lógica que se ejecuta al intentar enviar el formulario de edición.
formularioEditarPersona.addEventListener("submit", (event) => {
  // Evita la recarga de la página por el envío tradicional del formulario.
  event.preventDefault();

  // Valida los campos y excluye el registro actual de la comprobación de duplicados.
  if (
    !validarFormularioPersona(
      formularioEditarPersona,
      // Pasa el ID de la persona que se está editando al validador.
      document.getElementById("editarPersonaID").value,
    )
  ) {
    // Detiene el envío si la validación informa errores.
    return;
  }

  // Envía al backend los cambios validados.
  EditarPersona();
});

// Carga los datos iniciales de la tabla al ejecutar este archivo.
obtenerPersonas();