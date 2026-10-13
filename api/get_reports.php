<?php
header('Content-Type: application/json; charset=utf-8');

require_once  '/../config/db.php';
require_once '/../models/ReportModel.php';

// /** @var mysqli $conn */
$reportModel = new ReportModel($conn);
$reports = $reportModel->getActiveReports();

echo json_encode([
    'status' => 'success',
    'data'   => $reports
]);
?>