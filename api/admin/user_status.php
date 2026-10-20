<?php
// POST /api/admin/user_status.php  { user_id, action: 'block' | 'unblock' }  (chỉ admin)
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../controllers/AdminController.php';

require_method('POST');
$admin = require_admin();
respond((new AdminController($conn))->updateUserStatus((int)$admin['id'], get_input()));

