<?php
class ReportModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getActiveReports() {
    $sql = "SELECT r.*, 
                   COALESCE(u.username, 'Ẩn danh') AS username, 
                   COALESCE(u.reputation_score, 0) AS reputation_score 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.status = 'dang_dien_ra' 
            ORDER BY r.created_at DESC";
            
    $result = $this->conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
        return [];
    }

    public function createReport($userId, $type, $severity, $latitude, $longitude, $addressText, $description, $imageUrl = null) {
        $sql = "INSERT INTO reports (user_id, type, severity, latitude, longitude, address_text, description, image_url, confirm_count, reject_count, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'dang_dien_ra', NOW(), NOW())";
        
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            return false;
        }

        $stmt->bind_param("isssdsss", $userId, $type, $severity, $latitude, $longitude, $addressText, $description, $imageUrl);
        return $stmt->execute();
    }
}
?>