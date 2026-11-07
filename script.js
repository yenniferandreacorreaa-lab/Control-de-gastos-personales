// Elementos del formulario
const formularioGasto = document.getElementById('formularioGasto');
const inputDescripcion = document.getElementById('descripcion');
const inputValor = document.getElementById('valor');
const selectCategoria = document.getElementById('categoria');

// Elementos de la página
const tablaGastos = document.getElementById('tablaGastos');
const filtroCategoria = document.getElementById('filtroCategoria');
const totalGastos = document.getElementById('totalGastos');

// Mensajes de error
const errorDescripcion = document.getElementById('errorDescripcion');
const errorValor = document.getElementById('errorValor');
const errorCategoria = document.getElementById('errorCategoria');

const PRESUPUESTO = 500000;
const CLAVE_STORAGE = 'gastosPersonales';

// Recuperamos los gastos guardados. Si no hay datos, comenzamos con un arreglo vacío.
let gastos = [];

try {
  const datosGuardados = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
  gastos = Array.isArray(datosGuardados) ? datosGuardados : [];
} catch (error) {
  gastos = [];
}

// Convierte un número a pesos colombianos.
function formatearPesos(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor);
}

// Guarda el arreglo completo en el almacenamiento del navegador.
function guardarGastos() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(gastos));
}

// Limpia los mensajes de validación.
function limpiarErrores() {
  errorDescripcion.textContent = '';
  errorValor.textContent = '';
  errorCategoria.textContent = '';
}

// Dibuja nuevamente la tabla y calcula el total según el filtro seleccionado.
function render() {
  tablaGastos.textContent = '';

  const categoriaSeleccionada = filtroCategoria.value;

  const gastosVisibles = categoriaSeleccionada === 'Todos'
    ? gastos
    : gastos.filter(gasto => gasto.categoria === categoriaSeleccionada);

  if (gastosVisibles.length === 0) {
    const filaVacia = document.createElement('tr');
    const celdaVacia = document.createElement('td');

    celdaVacia.colSpan = 4;
    celdaVacia.classList.add('vacio');
    celdaVacia.textContent = 'No hay gastos para mostrar.';
    filaVacia.appendChild(celdaVacia);
    tablaGastos.appendChild(filaVacia);
  } else {
    gastosVisibles.forEach(gasto => {
      const fila = document.createElement('tr');

      const celdaDescripcion = document.createElement('td');
      celdaDescripcion.textContent = gasto.descripcion;

      const celdaCategoria = document.createElement('td');
      celdaCategoria.textContent = gasto.categoria;

      const celdaValor = document.createElement('td');
      celdaValor.textContent = formatearPesos(gasto.valor);

      const celdaAccion = document.createElement('td');
      const botonEliminar = document.createElement('button');
      botonEliminar.type = 'button';
      botonEliminar.textContent = 'Eliminar';
      botonEliminar.classList.add('boton-eliminar');
      botonEliminar.dataset.id = gasto.id;

      celdaAccion.appendChild(botonEliminar);
      fila.appendChild(celdaDescripcion);
      fila.appendChild(celdaCategoria);
      fila.appendChild(celdaValor);
      fila.appendChild(celdaAccion);

      tablaGastos.appendChild(fila);
    });
  }

  const total = gastosVisibles.reduce((acumulado, gasto) => acumulado + gasto.valor, 0);
  totalGastos.textContent = `Total gastado: ${formatearPesos(total)}`;

  // La alerta de presupuesto se basa siempre en el total general, no en el filtro.
  const totalGeneral = gastos.reduce((acumulado, gasto) => acumulado + gasto.valor, 0);
  totalGastos.classList.toggle('presupuesto-superado', totalGeneral > PRESUPUESTO);
}

// Registrar un gasto
formularioGasto.addEventListener('submit', (evento) => {
  evento.preventDefault();
  limpiarErrores();

  const descripcion = inputDescripcion.value.trim();
  const valor = Number(inputValor.value);
  const categoria = selectCategoria.value;
  let formularioValido = true;

  if (descripcion === '') {
    errorDescripcion.textContent = 'Escribe la descripción del gasto.';
    formularioValido = false;
  }

  if (inputValor.value.trim() === '') {
    errorValor.textContent = 'Escribe el valor del gasto.';
    formularioValido = false;
  } else if (!Number.isFinite(valor) || valor <= 0) {
    errorValor.textContent = 'El valor debe ser un número mayor que cero.';
    formularioValido = false;
  }

  if (categoria === '') {
    errorCategoria.textContent = 'Selecciona una categoría.';
    formularioValido = false;
  }

  if (!formularioValido) {
    return;
  }

  const nuevoGasto = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    descripcion: descripcion,
    valor: valor,
    categoria: categoria
  };

  gastos.push(nuevoGasto);
  guardarGastos();
  formularioGasto.reset();
  filtroCategoria.value = 'Todos';
  render();
  inputDescripcion.focus();
});

// Delegación de eventos: un solo listener para todos los botones de eliminar.
tablaGastos.addEventListener('click', (evento) => {
  if (evento.target.matches('.boton-eliminar')) {
    const idGasto = evento.target.dataset.id;
    gastos = gastos.filter(gasto => gasto.id !== idGasto);
    guardarGastos();
    render();
  }
});

// Actualizar la tabla y el total cuando cambia el filtro.
filtroCategoria.addEventListener('change', render);

// Primera representación al abrir la página.
render();