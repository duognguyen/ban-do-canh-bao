<?php
// POST /api/logout.php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_method('POST', 'GET');
respond((new AuthController($conn))->logout());
