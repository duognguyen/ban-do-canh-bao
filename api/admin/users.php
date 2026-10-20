<?php
// GET /api/admin/users.php  -> danh sách người dùng (chỉ admin)
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../controllers/AdminController.php';

require_method('GET');
require_admin();
respond((new AdminController($conn))->listUsers());

