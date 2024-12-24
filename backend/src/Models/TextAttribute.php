<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class TextAttribute extends AbstractAttribute
{
    public function __construct($data)
    {
        $this->name = $data['attribute_name'];
        $this->type = 'text';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT display_value, value FROM attribute_items WHERE attribute_id = ?");
        $stmt->execute([$data['id']]);
        $this->items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function isSwatch(): bool
    {
        return false;
    }
}
