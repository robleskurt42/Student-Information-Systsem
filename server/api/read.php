<?php
// server/api/read.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/Database.php';
include_once '../classes/Student.php';

$database = new Database();
$db = $database->getConnection();

$student = new Student($db);
$stmt = $student->read();
$num = $stmt->rowCount();

$students_arr = array();

if($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Mas ligtas ito kaysa mag-extract dahil kitang-kita mo kung saan nanggagaling ang data
        $student_item = array(
            "id"             => $row['id'],
            "student_number" => $row['student_number'],
            "first_name"     => $row['first_name'],
            "last_name"      => $row['last_name'],
            "email"          => $row['email'],
            "course"         => $row['course'],
            "year_level"     => $row['year_level']
            // "created_at"   => $row['created_at'] // I-uncomment lang kung may ganitong column sa DB mo
        );
        array_push($students_arr, $student_item);
    }
}

// Magandang practice: Isang bagsakan na lang ang pag-return ng response sa dulo
http_response_code(200);
echo json_encode($students_arr);
?>