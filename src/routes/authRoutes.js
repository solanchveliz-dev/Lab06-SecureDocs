const router = require('express').Router();
const ctrl = require('../auth/authController');
const { autenticar } = require('../auth/authMiddleware');

router.post('/login', ctrl.login);
router.post('/logout', autenticar, ctrl.logout);
router.get('/me', autenticar, ctrl.me);

module.exports = router;