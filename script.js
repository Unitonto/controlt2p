// Cargar historial al inicio
document.addEventListener('DOMContentLoaded', actualizarHistorial);

// Función para mostrar la imagen ampliada en el modal
window.verImagen = (url) => {
    document.getElementById('modalImage').src = url;
    document.getElementById('modal').style.display = 'flex';
};

// Función para cerrar el modal
window.cerrarModal = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalImage').src = '';
};

// Función para registrar retiro
window.registrarRetiro = async () => {
    const nombreAyudante = document.getElementById('nombreAyudante').value;
    const personaEntrega = document.getElementById('personaEntrega').value;
    const evidenciaFoto = document.getElementById('evidenciaFoto').files[0];

    if (!nombreAyudante || !personaEntrega || !evidenciaFoto) {
        alert('Por favor, complete todos los campos');
        return;
    }

    const fechaHoraRetiro = new Date().toLocaleString();
    const storageRef = ref(storage, 'evidencias/' + evidenciaFoto.name);
    await uploadBytes(storageRef, evidenciaFoto);
    const evidenciaURL = await getDownloadURL(storageRef);

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
};

// Función para actualizar el historial en la tabla
window.actualizarHistorial = async () => {
    const tbody = document.getElementById('historial').querySelector('tbody');
    tbody.innerHTML = '';
    
    const snapshot = await getDocs(collection(db, 'historial'));
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
};

// Función para marcar como devuelto
window.marcarDevolucion = async (docId) => {
    const docRef = doc(db, 'historial', docId);
    await updateDoc(docRef, {
        devuelto: true,
        fechaHoraDevolucion: new Date().toLocaleString()
    });
    actualizarHistorial();
};

// Función para limpiar el historial
window.limpiarHistorial = async () => {
    const password = document.getElementById('passwordInput').value;

    // Cambia esto por la contraseña que desees
    const correctPassword = "Guarambare2024"; // Cambia por tu contraseña
    
    if (password === correctPassword) {
        // Limpiar el historial en Firestore
        const snapshot = await getDocs(collection(db, 'historial'));
        const batch = writeBatch(db); // Crear un nuevo batch

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref); // Agregar la operación de eliminación al batch
        });

        await batch.commit(); // Ejecutar todas las operaciones de eliminación en el batch
        actualizarHistorial(); // Actualiza la tabla después de limpiar
        alert('Historial limpiado con éxito.');
        document.getElementById('passwordInput').value = ''; // Limpiar el campo de entrada
    } else {
        alert('Contraseña incorrecta. Inténtalo de nuevo.');
    }
};

