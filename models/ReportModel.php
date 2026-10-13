<?php
class ReportModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getActiveReports() {
        $sql = "SELECT r.*, u.username, u.reputation_score 
                FROM reports r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.status = 'dang_dien_ra' 
                ORDER BY r.created_at DESC";
                
        $result = $this->conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            return $result->fetch_all(MYSQLI_ASSOC);
        }
        return [];
    }
}
?>