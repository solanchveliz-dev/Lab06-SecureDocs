function horaLima() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false
  });
}

function construirEntorno(req) {
  const simular = process.env.PERMITIR_SIMULACION === 'true';
  return {
    hora: (simular && req.get('X-Hora')) || horaLima(),
    fecha: new Date().toISOString().slice(0, 10),
    direccion_ip: req.ip,
    ubicacion: (req.get('X-Ubicacion') || 'DESCONOCIDA').toUpperCase(),
    dispositivo: (req.get('X-Dispositivo') || 'DESCONOCIDO').toUpperCase()
  };
}

module.exports = { construirEntorno };