<?php

namespace App\Resolvers;

use App\Config\Database;
use App\Models\SimpleProduct;
use GraphQL\Type\Definition\ResolveInfo;
use PDO;

class QueryResolver
{
    public function categories()
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM categories");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function category($root, $args)
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE name = ?");
        $stmt->execute([$args['name']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function products($root, $args, $context, ResolveInfo $info)
    {
        $pdo = Database::getConnection();
        $categoryName = $args['category_name'] ?? null;
        if ($categoryName === null) {
            $stmt = $pdo->query("SELECT * FROM products");
        } elseif ($categoryName === 'all') {
            $stmt = $pdo->query("SELECT * FROM products");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ?");
            $stmt->execute([$categoryName]);
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $products = [];
        foreach ($rows as $r) {
            $products[] = new SimpleProduct($r);
        }
        return $products;
    }

    public function product($root, $args)
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM products WHERE product_id = ? LIMIT 1");
        $stmt->execute([$args['id']]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$data) return null;
        return new SimpleProduct($data);
    }
}
