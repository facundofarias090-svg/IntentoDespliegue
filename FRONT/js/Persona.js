const apiPersonas = "http://localhost:5046/api/Persona";
let personas = [];

function obtenerPersonas() {
  fetch(apiPersonas)
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      return respuesta.json();
    })
    .then((data) => {
      personas = data;
      mostrarPersonas(data);
    })
    .catch((error) => {
      console.error("No se pudo acceder a la API de personas:", error);
      alert("No se pudieron cargar las personas. Verificá que la API esté disponible.");
    });
}

function mostrarPersonas(data) {
  const tbody = document.getElementById("tablaPersonas");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach((element) => {
    const tr = tbody.insertRow();
    tr.insertCell(0).textContent = element.nombre;
    tr.insertCell(1).textContent = element.apellido;
    tr.insertCell(2).textContent = element.documento;

    const consultar = document.createElement("button");
    consultar.textContent = "Consultar";
    consultar.classList.add("button", "button-secondary");
    consultar.type = "button";
    consultar.onclick = function () {
      ConsultarPersona(element.personaID);
    };

    const editar = document.createElement("button");
    editar.textContent = "Editar";
    editar.classList.add("button", "button-secondary");
    editar.type = "button";
    editar.onclick = function () {
      BuscarValoresPersonas(element.personaID);
    };

    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.classList.add("button", "button-secondary");
    eliminar.type = "button";
    eliminar.onclick = function () {
      ValidacionEliminarPersona(element.personaID);
    };

    const celdaAcciones = tr.insertCell(3);
    celdaAcciones.classList.add("directory-actions");
    celdaAcciones.appendChild(consultar);
    celdaAcciones.appendChild(editar);
    celdaAcciones.appendChild(eliminar);
  });
}

function validarFormularioPersona(formulario, personaId = null) {
  const camposTexto = formulario.querySelectorAll('input[type="text"]');

  camposTexto.forEach((campo) => {
    campo.setCustomValidity(
      campo.value.trim() ? "" : "Este campo no puede estar vacío.",
    );
  });

  const documento = formulario.querySelector('[name="Documento"]');
  const documentoNormalizado = documento.value.trim().toLocaleLowerCase();
  const documentoDuplicado = personas.some(
    (persona) =>
      String(persona.documento).trim().toLocaleLowerCase() ===
        documentoNormalizado &&
      Number(persona.personaID) !== Number(personaId),
  );

  documento.setCustomValidity(
    documentoDuplicado ? "Ya existe una persona con ese documento." : "",
  );

  const salario = formulario.querySelector('[name="Salario"]');
  const valorSalario = Number(salario.value);
  salario.setCustomValidity(
    salario.value === "" || !Number.isFinite(valorSalario) || valorSalario < 0
      ? "El salario debe ser un número mayor o igual a 0."
      : "",
  );

  return formulario.reportValidity();
}

function AgregarPersona() {
  const nuevaPersona = {
    nombre: document.getElementById("Nombre").value.trim(),
    apellido: document.getElementById("Apellido").value.trim(),
    documento: document.getElementById("Documento").value.trim(),
    fechaNacimiento: document.getElementById("FechaNacimiento").value,
    direccion: document.getElementById("Direccion").value.trim(),
    salario: parseFloat(document.getElementById("Salario").value),
  };

  fetch(apiPersonas, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevaPersona),
  })
    .then((respuesta) => procesarRespuesta(respuesta))
    .then(() => {
      document.getElementById("persona-form").reset();
      obtenerPersonas();
    })
    .catch((error) => {
      console.error("No se pudo crear la persona:", error);
      alert(error.message || "No se pudo crear la persona.");
    });
}

function ConsultarPersona(id) {
  fetch(`${apiPersonas}/${id}`)
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      return respuesta.json();
    })
    .then((persona) => {
      document.getElementById("detalleNombre").textContent =
        `${persona.nombre} ${persona.apellido}`;
      document.getElementById("detalleDocumento").textContent =
        persona.documento;
      document.getElementById("detalleFechaNacimiento").textContent =
        persona.fechaFormateada;
      document.getElementById("detalleDireccion").textContent =
        persona.direccion;
      document.getElementById("detalleSalario").textContent =
        String(persona.salario).replace(/([,.])0+$/, "");
      document.getElementById("edit-modal-toggle").checked = false;
      document.getElementById("detail-modal-toggle").checked = true;
    })
    .catch((error) => {
      console.error("No se pudieron consultar los datos de la persona:", error);
      alert("No se pudieron consultar los datos de la persona.");
    });
}

function BuscarValoresPersonas(id) {
  const persona = personas.find((element) => element.personaID === id);

  if (!persona) {
    alert("No se encontró la persona seleccionada. Actualizá el listado e intentá nuevamente.");
    return;
  }

  document.getElementById("editarPersonaID").value = persona.personaID;
  document.getElementById("editarNombre").value = persona.nombre;
  document.getElementById("editarApellido").value = persona.apellido;
  document.getElementById("editarDocumento").value = persona.documento;
  document.getElementById("editarFechaNacimiento").value =
    persona.fechaFormateada.split("/").reverse().join("-");
  document.getElementById("editarDireccion").value = persona.direccion;
  document.getElementById("editarSalario").value = String(persona.salario).replace(",", ".");
  document.getElementById("detail-modal-toggle").checked = false;
  document.getElementById("edit-modal-toggle").checked = true;
}

function EditarPersona() {
  const id = document.getElementById("editarPersonaID").value;
  const editarPersona = {
    personaID: parseInt(id),
    nombre: document.getElementById("editarNombre").value.trim(),
    apellido: document.getElementById("editarApellido").value.trim(),
    documento: document.getElementById("editarDocumento").value.trim(),
    fechaNacimiento: document.getElementById("editarFechaNacimiento").value,
    direccion: document.getElementById("editarDireccion").value.trim(),
    salario: parseFloat(document.getElementById("editarSalario").value),
  };

  fetch(`${apiPersonas}/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editarPersona),
  })
    .then((respuesta) => procesarRespuesta(respuesta))
    .then(() => {
      document.getElementById("editar-persona-form").reset();
      document.getElementById("edit-modal-toggle").checked = false;
      obtenerPersonas();
    })
    .catch((error) => {
      console.error("No se pudo editar la persona:", error);
      alert(error.message || "No se pudo editar la persona.");
    });
}

function ValidacionEliminarPersona(id) {
  const siElimina = confirm("¿Está seguro de eliminar esta persona?");
  if (siElimina) {
    EliminarPersona(id);
  }
}

function EliminarPersona(id) {
  fetch(`${apiPersonas}/${id}`, {
    method: "DELETE",
  })
    .then((respuesta) => procesarRespuesta(respuesta))
    .then(() => {
      obtenerPersonas();
    })
    .catch((error) => {
      console.error("No se pudo eliminar la persona:", error);
      alert(error.message || "No se pudo eliminar la persona.");
    });
}

function procesarRespuesta(respuesta) {
  return respuesta.text().then((mensaje) => {
    if (!respuesta.ok) {
      throw new Error(mensaje || `Error HTTP: ${respuesta.status}`);
    }

    return mensaje;
  });
}

const formularioPersona = document.getElementById("persona-form");
formularioPersona.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validarFormularioPersona(formularioPersona)) {
    return;
  }

  AgregarPersona();
});

const formularioEditarPersona = document.getElementById(
  "editar-persona-form",
);
formularioEditarPersona.addEventListener("submit", (event) => {
  event.preventDefault();

  if (
    !validarFormularioPersona(
      formularioEditarPersona,
      document.getElementById("editarPersonaID").value,
    )
  ) {
    return;
  }

  EditarPersona();
});

obtenerPersonas();