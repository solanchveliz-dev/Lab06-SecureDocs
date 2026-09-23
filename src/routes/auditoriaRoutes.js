const router = require('express').Router();
const { autenticar } = require('../auth/authMiddleware');
const { autorizar } = require('../authorization/authorize');
const audit = require('../services/auditService');

router.get('/', autenticar, autorizar('VIEW_AUDIT'), async (req, res) => {
  res.json(await audit.listar());
});

module.exports = router;