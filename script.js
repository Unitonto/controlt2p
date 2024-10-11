// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGoBcYaPDQsMFxreFIjn0XraHdkfq3lqc",
  authDomain: "controldet2p.firebaseapp.com",
  projectId: "controldet2p",
  storageBucket: "controldet2p.appspot.com",
  messagingSenderId: "683643469531",
  appId: "1:683643469531:web:5c81f09d8361a427e696fe",
  measurementId: "G-MS62MDX4VX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Función para mostrar la sección seleccionada
function mostrarSeccion(seccion) {
  document.getElementById('registro').classList.add('hidden');
  document.getElementById('historial').classList.add('hidden');
  document.getElementById(seccion).classList.remove('hidden');
}

// Función para registrar un retiro
async function registrarRetiro() {
  const nombreAyudante = document.getElementById('nombreAyudante').value;
  const personaEntrega = document.getElementById('personaEntrega').value;
  const evidenciaFoto = document.getElementById('evidenciaFoto').files[0];

  if (!nombreAyudante || !personaEntrega || !evidenciaFoto) {
    alert('Por favor, complete todos los campos');
    return;
  }

  const fechaHoraRetiro = new Date().toLocaleString();
  const storageRef = storage.ref('evidencias/' + evidenciaFoto.name);
  await storageRef.put(evidenciaFoto);
  const evidenciaURL = await storageRef.getDownloadURL();

  // Guardamos el registro en Firestore
  const registro = {
    nombreAyudante,
    personaEntrega,
    fechaHoraRetiro,
    evidenciaURL,
    devuelto: false,
    fechaHoraDevolucion: ""
  };

  await db.collection('historial').add(registro);
  
  // Limpiar formulario y actualizar la tabla
  document.getElementById('nombreAyudante').value = '';
  document.getElementById('personaEntrega').value = '';
  document.getElementById('evidenciaFoto').value = '';
  actualizarHistorial();
}

// Función para marcar como devuelto
async function marcarDevolucion(docId) {
  await db.collection('historial').doc(docId).update({
    devuelto: true,
    fechaHoraDevolucion: new Date().toLocaleString()
  });
  actualizarHistorial();
}

// Función para actualizar el historial en la tabla
async function actualizarHistorial() {
  const tbody = document.getElementById('historial').querySelector('tbody');
  tbody.innerHTML = '';
  
  const snapshot = await db.collection('historial').get();
  snapshot.forEach(doc => {
    const registro = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${registro.nombreAyudante}</td>
      <td>${registro.personaEntrega}</td>
      <td>${registro.fechaHoraRetiro}</td>
      <td><img src="${registro.evidenciaURL}" alt="Evidencia" width="50" onclick="verImagen('${registro.evidenciaURL}')"></td>
      <td>${registro.devuelto ? registro.fechaHoraDevolucion : 'Pendiente'}</td>
      <td>
        ${registro.devuelto ? 'Devuelto' : `<button class="return-btn" onclick="marcarDevolucion('${doc.id}')">Marcar Devolución</button>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Función para mostrar la imagen ampliada en el modal
function verImagen(url) {
  document.getElementById('modalImage').src = url;
  document.getElementById('modal').style.display = 'flex';
}

// Función para cerrar el modal
function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modalImage').src = '';
}

// Función para limpiar el historial
function limpiarHistorial() {
  const password = document.getElementById('passwordInput').value;

  // Cambia esto por la contraseña que desees
  const correctPassword = "tuContraseñaSegura"; // Cambia por tu contraseña
  
  if (password === correctPassword) {
    // Limpiar el historial en Firestore
    db.collection('historial').get().then((snapshot) => {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    }).then(() => {
      actualizarHistorial(); // Actualiza la tabla después de limpiar
      alert('Historial limpiado con éxito.');
      document.getElementById('passwordInput').value = ''; // Limpiar el campo de entrada
    }).catch((error) => {
      console.error("Error al limpiar el historial: ", error);
    });
  } else {
    alert('Contraseña incorrecta. Inténtalo de nuevo.');
  }
}

// Cargar historial al inicio
document.addEventListener('DOMContentLoaded', actualizarHistorial);

  
