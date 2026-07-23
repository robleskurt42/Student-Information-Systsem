<?php
// 1. Siguraduhing ito ang PINAKA-UNANG linya ng code
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. SALUHIN ANG PREFLIGHT (OPTIONS) REQUEST AT MAGBALIK NG OK STATUS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. DITO PA LANG DAPAT MABASA YUNG MGA INCLUDES AT CONNECTION CODES
include_once '../config/database.php';
// ... (tuloy na ang lumang code mo para sa pag-INSERT ng data)
include_once '../classes/Student.php';

$database = new Database();
$db = $database->getConnection();

$student = new Student($db);

// Kunin at basahin ang pinadalang JSON data mula sa React
$data = json_decode(file_get_contents("php://input"));

// Siguraduhing may laman ang $data bago i-assign
if (
    !empty($data->student_number) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->course) &&
    !empty($data->year_level)
) {
    // I-assign ang properties sa iyong Student object (para magamit sa loob ng Student class)
    $student->student_number = $data->student_number;
    $student->first_name = $data->first_name;
    $student->last_name = $data->last_name;
    $student->email = $data->email;
    $student->course = $data->course;
    $student->year_level = $data->year_level;

    // Patakbuhin ang create method ng Student class
    if($student->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Student was added successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to add student."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Fill out all fields."]);
}
?>