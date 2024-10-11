// Mantén las funciones que ya se definieron en el bloque de <script type="module"> en index.html

// Función para mostrar la sección seleccionada
window.mostrarSeccion = function(seccion) {
    document.getElementById('registro').classList.add('hidden');
    document.getElementById('historial').classList.add('hidden');
    document.getElementById(seccion).classList.remove('hidden');
  };
  
  // Función para registrar un retiro
  window.registrarRetiro = async function() {
    const nombreAyudante = document.getElementById('nombreAyudante').value;
    const personaEntrega = document.getElementById('personaEntrega').value;
    const evidenciaFoto = document.getElementById('evidenciaFoto').files[0];
  
    if (!nombreAyudante || !personaEntrega || !evidenciaFoto) {
      alert('Por favor, complete todos los campos');
      return;
    }
  
    const fechaHoraRetiro = new Date().toLocaleString();
    const imageRef = ref(storage, `evidencias/${evidenciaFoto.name}`);
  
    // Subir el archivo
    try {
      await uploadBytes(imageRef, evidenciaFoto);
      const evidenciaURL = await getDownloadURL(imageRef);
  
      // Guardamos el registro en Firestore
      const registro = {
        nombreAyudante,
        personaEntrega,
        fechaHoraRetiro,
        evidenciaURL,
        devuelto: false,
        fechaHoraDevolucion: ""
      };
  
      await addDoc(collection(db, 'historial'), registro);
  
      // Limpiar formulario y actualizar la tabla
      document.getElementById('nombreAyudante').value = '';
      document.getElementById('personaEntrega').value = '';
      document.getElementById('evidenciaFoto').value = '';
      actualizarHistorial();
    } catch (error) {
      console.error("Error al registrar el retiro: ", error);
    }
  };
  
  // Función para actualizar el historial en la tabla
  window.actualizarHistorial = async function() {
    const historial = await getDocs(collection(db, 'historial'));
    const tbody = document.getElementById('historial').querySelector('tbody');
    tbody.innerHTML = '';
  
    historial.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement('tr');
  
      row.innerHTML = `
        <td>${data.nombreAyudante}</td>
        <td>${data.personaEntrega}</td>
        <td>${data.fechaHoraRetiro}</td>
        <td><img src="${data.evidenciaURL}" alt="Evidencia" width="50" onclick="verImagen('${data.evidenciaURL}')"></td>
        <td>${data.devuelto ? data.fechaHoraDevolucion : 'Pendiente'}</td>
        <td>
          ${data.devuelto ? 'Devuelto' : `<button class="return-btn" onclick="marcarDevolucion('${doc.id}')">Marcar Devolución</button>`}
        </td>
      `;
  
      tbody.appendChild(row);
    });
  };


// Cargar historial al inicio
  document.addEventListener('DOMContentLoaded', actualizarHistorial);

  
