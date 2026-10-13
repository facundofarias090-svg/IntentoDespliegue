function obtenerProducto() {
    fetch("http://localhost:5049/api/Producto")
      .then((respuesta) => respuesta.json())
      .then((data) => {
        console.log(data);
  
        mostrarProductos(data);
      })
      .catch((error) => console.error(error));
  }
  
  function mostrarProductos(data) {
    const tbody = document.getElementById("tablaProductos");
    if (!tbody) return;
    tbody.innerHTML = "";
  
    data.forEach((element) => {
      console.log(data);
      let tr = tbody.insertRow();
      tr.insertCell(0).innerHTML = element.nombreProducto;
      tr.insertCell(1).innerHTML = element.stockProducto;
      tr.insertCell(2).innerHTML = element.precioCostoProducto;
      tr.insertCell(3).innerHTML = element.precioVentaProducto;
  
      tr.insertCell(4).innerHTML = element.nombreCategoria;
  
      // Crear botón
      let editar = document.createElement("button");
  
      editar.textContent = "Editar";
      editar.classList.add("btn", "btn-primary");
  
      editar.setAttribute(
        "onclick",
        `BuscarValoresProductos(${element.productoID})`,
      );
  
      // Celda del botón
      let tdEditar = tr.insertCell(5);
      tdEditar.appendChild(editar);
  
      let eliminar = document.createElement("button");
      eliminar.textContent = "Eliminar";
      eliminar.classList.add("btn", "btn-danger");
  
      eliminar.onclick = function () {
        ValidacionEliminarproducto(element.productoID);
      };
  
      let tdEliminar = tr.insertCell(6);
      tdEliminar.appendChild(eliminar);
    });
  }
  
  function obtenerCategorias() {
    fetch("http://localhost:5049/api/Producto/idCategorias")
      .then((respuesta) => respuesta.json())
      .then((data) => {
        let opciones = '<option value="">[SELECCIONE...]</option>';
  
        data.forEach((categoria) => {
          opciones += `
                      <option value="${categoria.id}">
                          ${categoria.nombre}
                      </option>
                  `;
        });
  
        document.getElementById("CategoriaID").innerHTML = opciones;
        document.getElementById("CategoriaIDeditar").innerHTML = opciones;
      })
      .catch((error) => console.error("Error categorías:", error));
  }
  
  function AgregarProducto() {
    var nuevaProducto = {
      nombre: document.getElementById("nombre").value,
      stock: parseInt(document.getElementById("stock").value),
      precioCosto: parseFloat(document.getElementById("precioCosto").value),
      precioVenta: parseFloat(document.getElementById("precioVenta").value),
      categoriaID: parseInt(document.getElementById("CategoriaID").value),
    };
    console.log("Producto enviado:", nuevaProducto);
  
    fetch("http://localhost:5049/api/Producto", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaProducto),
    })
      .then((respuesta) => respuesta.json())
      .then((data) => {
        document.getElementById("nombre").value = "";
        document.getElementById("stock").value = "";
        document.getElementById("precioCosto").value = "";
        document.getElementById("precioVenta").value = "";
        obtenerProducto();
      });
  }
  
  //Funcion para traer datos al modal
  function BuscarValoresProductos(id) {
    console.log("ID recibido:", id);
  
    fetch(`http://localhost:5049/api/Producto/${id}`)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
  
        return respuesta.json();
      })
      .then((data) => {
        console.log("Producto:", data);
        document.getElementById("idEditar").value = data.productoId;
        document.getElementById("CategoriaIDeditar").value = data.categoriaID;
        document.getElementById("nombreEditar").value = data.nombre;
        document.getElementById("precioCostoeditar").value = data.precioCosto;
        document.getElementById("precioVentaeditar").value = data.precioVenta;
        document.getElementById("stockeditar").value = data.stock;
  
        let modal = new bootstrap.Modal(
          document.getElementById("editarProducto"),
        );
  
        modal.show();
      })
      .catch((error) => {
        console.error("No se pudo acceder a la API:", error);
      });
  }
  
  function EditarProducto() {
    let id = document.getElementById("idEditar").value;
    console.log("ID recibido editar:", id);
  
    let editarProducto = {
      productoId: id,
      categoriaID: document.getElementById("CategoriaIDeditar").value,
      nombre: document.getElementById("nombreEditar").value,
      precioCosto: parseFloat(document.getElementById("precioCostoeditar").value),
      precioVenta: parseFloat(document.getElementById("precioVentaeditar").value),
      stock: document.getElementById("stockeditar").value,
    };
  
    fetch(`http://localhost:5049/api/Producto/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editarProducto),
    })
      .then(() => {
        document.getElementById("idEditar").value = 0;
        document.getElementById("CategoriaIDeditar").value = 0;
        document.getElementById("precioCostoeditar").value = "";
        document.getElementById("precioVentaeditar").value = "";
        document.getElementById("stockeditar").value = "";
  
        let modal = bootstrap.Modal.getInstance(
          document.getElementById("editarProducto"),
        );
  
        modal.hide();
        obtenerProducto();
      })
      .catch((error) => console.error("No se pudo editar la categoría.", error));
  }
  
  function ValidacionEliminarproducto(id) {
    console.log("id", id);
    var siElimina = confirm("¿Esta seguro de eliminar esta Producto?");
    if (siElimina == true) {
      Eliminar(id);
    }
  }
  function Eliminar(id) {
    fetch(`http://localhost:5049/api/Producto/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        obtenerProducto();
      })
      .catch((error) => console.error("No se pudo acceder a la api.", error));
  }
  
  obtenerProducto();
  obtenerCategorias();