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

// Función para marcar como devuelto
async function marcarDevolucion(docId) {
    await db.collection('historial').doc(docId).update({
        devuelto: true,
        fechaHoraDevolucion: new Date().toLocaleString()
    });
    actualizarHistorial();
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
async function limpiarHistorial() {
    const password = document.getElementById('passwordInput').value;

    // Cambia esto por la contraseña que desees
    const correctPassword = "tuContraseñaSegura"; // Cambia por tu contraseña
    
    if (password === correctPassword) {
        // Limpiar el historial en Firestore
        const snapshot = await db.collection('historial').get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        actualizarHistorial(); // Actualiza la tabla después de limpiar
        alert('Historial limpiado con éxito.');
        document.getElementById('passwordInput').value = ''; // Limpiar el campo de entrada
    } else {
        alert('Contraseña incorrecta. Inténtalo de nuevo.');
    }
}

// Cargar historial al inicio
document.addEventListener('DOMContentLoaded', actualizarHistorial);
