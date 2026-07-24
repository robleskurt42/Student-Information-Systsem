<?php
// server/config/database.php

class Database {
    private $host = "localhost";
    private $db_name = "student_information_system";
    private $username = "root";
    private $password = ""; 
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
           $this->conn = new PDO(
    "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
    $this->username,
    $this->password,
            );
            // I-set ang error mode sa exception para madaling i-debug
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode(["error" => "Database Connection Error: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>