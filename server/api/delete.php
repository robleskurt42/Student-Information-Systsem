<?php
// server/api/delete.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Isama ang database at class files
include_once '../config/Database.php';
include_once '../classes/Student.php';

$database = new Database();
$db = $database->getConnection();

$student = new Student($db);

// 2. Saluhin ang JSON galing React body o kaya sa URL query string 
$data = json_decode(file_get_contents("php://input"));
$id = isset($data->id) ? $data->id : (isset($_GET['id']) ? $_GET['id'] : null);

// 3. Siguraduhing may nakuha tayong ID bago mag-delete
if (!empty($id)) {
    // I-assign ang ID sa Student object property
    $student->id = $id;

    // 4. Patakbuhin ang delete method mula sa Student class
    if($student->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "Student was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete student."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to delete student. ID is required."]);
}
?>