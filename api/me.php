<?php
// GET /api/me.php -> { logged_in, user }
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_method('GET');
respond((new AuthController($conn))->me());

