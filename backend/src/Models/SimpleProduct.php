<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class SimpleProduct extends AbstractProduct
{
    protected $dbId;

    public function __construct($data)
    {
        $this->dbId = (int)$data['id'];
        $this->id = $data['product_id'];
        $this->name = $data['name'];
        $this->price = (float)$data['price'];
        $this->inStock = (bool)$data['in_stock'];
        $this->description = $data['description'];
        $this->mainImage = $data['main_image'];
        $this->category = $data['category'];
        $this->brand = $data['brand'];
    }

    public function getType(): string
    {
        return 'simple';
    }

    public function getAttributes()
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM attributes WHERE product_id = ?");
        $stmt->execute([$this->dbId]);
        $attrs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Fetched attributes for product_id {$this->dbId}: " . json_encode($attrs));
        $attributeObjects = [];
        foreach ($attrs as $attrData) {
            try {
                $attributeObjects[] = AttributeFactory::createAttribute($attrData);
            } catch (\Exception $e) {
                error_log("Attribute creation failed: " . $e->getMessage());
            }
        }
        return $attributeObjects;
    }

    public function getGallery()
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT image_url FROM galleries WHERE product_id = ?");
        $stmt->execute([$this->dbId]);
        $urls = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $urls;
    }
}
