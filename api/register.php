<?php
// POST /api/register.php  { username, email, password, confirm_password? }
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_method('POST');
respond((new AuthController($conn))->register(get_input()), 201);
