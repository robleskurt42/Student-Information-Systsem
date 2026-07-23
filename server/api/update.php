<?php
// server/api/update.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Isama ang database at class files (Kailangan ito para gumana si $student)
include_once '../config/Database.php';
include_once '../classes/Student.php';

$database = new Database();
$db = $database->getConnection();

$student = new Student($db);

// 2. Saluhin ang JSON data galing React
$data = json_decode(file_get_contents("php://input"));

// 3. Siguraduhing may ID at kumpleto ang mga kinakailangang field
if (
    !empty($data->id) &&
    !empty($data->student_number) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->course) &&
    !empty($data->year_level)
) {
    // 4. I-assign ang mga bagong data sa iyong Student object properties
    $student->id = $data->id;
    $student->student_number = $data->student_number;
    $student->first_name = $data->first_name;
    $student->last_name = $data->last_name;
    $student->email = $data->email;
    $student->course = $data->course;
    $student->year_level = $data->year_level;

    // 5. Patakbuhin ang update method mula sa Student class
    if($student->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Student record was updated successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to update student."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Fill out all fields for update."]);
}
?>