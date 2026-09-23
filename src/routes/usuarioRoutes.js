const router = require('express').Router();
const { autenticar } = require('../auth/authMiddleware');
const { autorizar } = require('../authorization/authorize');
const ctrl = require('../controllers/usuarioController');

router.use(autenticar);

router.get('/', autorizar('MANAGE_USERS'), ctrl.listar);
router.post('/', autorizar('MANAGE_USERS'), ctrl.crear);
router.put('/:id', autorizar('MANAGE_USERS'), ctrl.actualizar);
router.put('/:id/rol', autorizar('ASSIGN_ROLES'), ctrl.asignarRol);

module.exports = router;