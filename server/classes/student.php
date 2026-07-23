<?php
// server/classes/Student.php

class Student {
    private $conn;
    private $table_name = "students";

    // Properties ng Student Object
    public $id;
    public $student_number;
    public $first_name;
    public $last_name;
    public $email;
    public $course;
    public $year_level;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. CREATE (Add Student)
    public function create() {
       $query = "INSERT INTO " . $this->table_name . " (student_number, first_name, last_name, email, course, year_level) 
          VALUES (:student_number, :first_name, :last_name, :email, :course, :year_level)";
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs para iwas exploit
        $this->student_number = htmlspecialchars(strip_tags($this->student_number));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->year_level = htmlspecialchars(strip_tags($this->year_level));

        // Bind parameters
        $stmt->bindParam(":student_number", $this->student_number);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":course", $this->course);
        $stmt->bindParam(":year_level", $this->year_level);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 2. READ (Get All Students)
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 3. UPDATE (Edit Student)
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET student_number=:student_number, first_name=:first_name, 
                      last_name=:last_name, email=:email, course=:course, year_level=:year_level 
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->student_number = htmlspecialchars(strip_tags($this->student_number));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->year_level = htmlspecialchars(strip_tags($this->year_level));

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":student_number", $this->student_number);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":course", $this->course);
        $stmt->bindParam(":year_level", $this->year_level);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 4. DELETE (Remove Student)
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>