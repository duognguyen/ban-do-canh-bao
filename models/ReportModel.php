<?php
<<<<<<< HEAD
=======
// File: models/ReportModel.php
// Chỉ làm việc với bảng `reports` và `report_votes`.
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
class ReportModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

<<<<<<< HEAD
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
}
?>
=======
    // Danh sách báo cáo đang diễn ra (kèm tên người báo + điểm uy tín)
    public function getActiveReports(?string $type = null): array {
        $sql = "SELECT r.*,
                       COALESCE(u.username, 'Ẩn danh') AS username,
                       COALESCE(u.reputation_score, 0) AS reputation_score
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.status = 'dang_dien_ra'";
        if ($type !== null) {
            $sql .= " AND r.type = ?";
        }
        $sql .= " ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        if ($type !== null) {
            $stmt->bind_param("s", $type);
        }
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Trả về id mới (int) hoặc false
    public function createReport($userId, $type, $severity, $latitude, $longitude, $addressText, $description, $imageUrl = null) {
        $sql = "INSERT INTO reports (user_id, type, severity, latitude, longitude, address_text, description, image_url, confirm_count, reject_count, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'dang_dien_ra', NOW(), NOW())";

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("issddsss", $userId, $type, $severity, $latitude, $longitude, $addressText, $description, $imageUrl);
        return $stmt->execute() ? $this->conn->insert_id : false;
    }

    // Bình chọn / đổi bình chọn. Trả: ['ok'=>true,'data'=>[confirm_count,reject_count,my_vote]] hoặc ['ok'=>false,'error','code']
    public function vote(int $reportId, int $userId, string $voteType): array {
        $this->conn->begin_transaction();
        try {
            $stmt = $this->conn->prepare("SELECT user_id, status FROM reports WHERE id = ? FOR UPDATE");
            $stmt->bind_param("i", $reportId);
            $stmt->execute();
            $report = $stmt->get_result()->fetch_assoc();

            if (!$report) {
                $this->conn->rollback();
                return ['ok' => false, 'error' => 'Báo cáo không tồn tại', 'code' => 404];
            }
            if ($report['status'] !== 'dang_dien_ra') {
                $this->conn->rollback();
                return ['ok' => false, 'error' => 'Báo cáo này đã kết thúc hoặc bị ẩn', 'code' => 409];
            }
            if ((int)$report['user_id'] === $userId) {
                $this->conn->rollback();
                return ['ok' => false, 'error' => 'Bạn không thể bình chọn báo cáo của chính mình', 'code' => 403];
            }

            $stmt = $this->conn->prepare("SELECT vote_type FROM report_votes WHERE report_id = ? AND user_id = ? FOR UPDATE");
            $stmt->bind_param("ii", $reportId, $userId);
            $stmt->execute();
            $existing = $stmt->get_result()->fetch_assoc();

            if ($existing && $existing['vote_type'] === $voteType) {
                $this->conn->rollback();
                return ['ok' => false, 'error' => 'Bạn đã bình chọn lựa chọn này rồi', 'code' => 409];
            }

            if ($existing) {
                // Đổi ý: chuyển 1 phiếu từ loại cũ sang loại mới
                $stmt = $this->conn->prepare("UPDATE report_votes SET vote_type = ? WHERE report_id = ? AND user_id = ?");
                $stmt->bind_param("sii", $voteType, $reportId, $userId);
                $stmt->execute();
                $sql = ($voteType === 'confirm')
                    ? "UPDATE reports SET confirm_count = confirm_count + 1, reject_count = GREATEST(reject_count - 1, 0) WHERE id = ?"
                    : "UPDATE reports SET reject_count = reject_count + 1, confirm_count = GREATEST(confirm_count - 1, 0) WHERE id = ?";
            } else {
                $stmt = $this->conn->prepare("INSERT INTO report_votes (report_id, user_id, vote_type) VALUES (?, ?, ?)");
                $stmt->bind_param("iis", $reportId, $userId, $voteType);
                $stmt->execute();
                $sql = ($voteType === 'confirm')
                    ? "UPDATE reports SET confirm_count = confirm_count + 1 WHERE id = ?"
                    : "UPDATE reports SET reject_count = reject_count + 1 WHERE id = ?";
            }
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $reportId);
            $stmt->execute();

            $stmt = $this->conn->prepare("SELECT confirm_count, reject_count FROM reports WHERE id = ?");
            $stmt->bind_param("i", $reportId);
            $stmt->execute();
            $counts = $stmt->get_result()->fetch_assoc();

            $this->conn->commit();
            return ['ok' => true, 'data' => [
                'report_id'     => $reportId,
                'confirm_count' => (int)$counts['confirm_count'],
                'reject_count'  => (int)$counts['reject_count'],
                'my_vote'       => $voteType,
            ]];
        } catch (Throwable $e) {
            $this->conn->rollback();
            throw $e;
        }
    }
}
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
