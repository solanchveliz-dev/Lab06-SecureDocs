const router = require('express').Router();
const { autenticar } = require('../auth/authMiddleware');
const { autorizar } = require('../authorization/authorize');
const ctrl = require('../controllers/documentoController');
const documentoService = require('../services/documentoService');

const cargarDocumento = (req) => documentoService.buscarPorId(req.params.id);

// Documento "candidato" para evaluar ABAC antes de crearlo
const documentoNuevo = async (req) => ({
  titulo: req.body?.titulo,
  departamento: req.usuario.departamento,
  nivel_confidencialidad: Number(req.body?.nivel_confidencialidad || 1),
  pais: req.usuario.pais,
  estado: 'PENDIENTE',
  propietario: req.usuario.id
});

router.use(autenticar);

router.get('/', autorizar('READ'), ctrl.listar);
router.get('/:id', autorizar('READ', cargarDocumento), ctrl.obtener);
router.post('/', autorizar('CREATE', documentoNuevo), ctrl.crear);
router.put('/:id', autorizar('UPDATE', cargarDocumento), ctrl.actualizar);
router.delete('/:id', autorizar('DELETE', cargarDocumento), ctrl.eliminar);
router.post('/:id/aprobar', autorizar('APPROVE', cargarDocumento), ctrl.aprobar);

module.exports = router;