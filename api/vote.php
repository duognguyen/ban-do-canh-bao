<?php
// POST /api/vote.php  { report_id, vote_type: 'confirm' | 'reject' }  (cần đăng nhập)
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/ReportController.php';

require_method('POST');
$user = require_login();
respond((new ReportController($conn))->vote((int)$user['id'], get_input()));

