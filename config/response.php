<?php
// ==========================================================================
// Helper dùng chung cho mọi API: trả JSON đồng nhất
// Dạng chuẩn: { "status": "success|error", "message": "...", "data": ... }
// ==========================================================================

function json_response(int $httpCode, string $status, string $message, $data = null): void
{
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(
        ['status' => $status, 'message' => $message, 'data' => $data],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

function json_success($data = null, string $message = 'OK', int $httpCode = 200): void
{
    json_response($httpCode, 'success', $message, $data);
}

function json_error(string $message, int $httpCode = 400): void
{
    json_response($httpCode, 'error', $message, null);
}

/**
 * Trả response từ kết quả của Controller.
 * Controller trả về: ['ok'=>true,'data'=>..,'message'=>..] hoặc ['ok'=>false,'error'=>..,'code'=>..]
 */
function respond(array $result, int $successCode = 200): void
{
    if (!empty($result['ok'])) {
        json_success($result['data'] ?? null, $result['message'] ?? 'OK', $successCode);
    }
    json_error($result['error'] ?? 'Có lỗi xảy ra', $result['code'] ?? 400);
}

/** Chỉ cho phép các HTTP method khai báo, ngược lại trả 405. */
function require_method(string ...$methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        json_error('Phương thức không được hỗ trợ', 405);
    }
}

/** Đọc input từ JSON body hoặc form (FormData / x-www-form-urlencoded). */
function get_input(): array
{
    $json = json_decode(file_get_contents('php://input'), true);
    if (is_array($json)) {
        return $json;
    }
    return $_POST;
}

