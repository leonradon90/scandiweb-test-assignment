<?php

namespace App\Resolvers;

use App\Config\Database;
use Exception;
use GraphQL\Type\Definition\ResolveInfo;

class MutationResolver
{
    public function placeOrder($root, $args, $context, ResolveInfo $info)
    {
        $orderData = $args['order'];
        $pdo = Database::getConnection();
        $pdo->beginTransaction();
        try {
            if (empty($orderData['products'])) {
                throw new Exception("Order must contain at least one product.");
            }
            $productIds = array_map(function($prod) {
                return $prod['id'];
            }, $orderData['products']);
            $inQuery = implode(',', array_fill(0, count($productIds), '?'));
            $stmt = $pdo->prepare("SELECT product_id FROM products WHERE product_id IN ($inQuery)");
            $stmt->execute($productIds);
            $existingProductIds = $stmt->fetchAll(\PDO::FETCH_COLUMN, 0);
            $invalidProductIds = array_diff($productIds, $existingProductIds);
            if (!empty($invalidProductIds)) {
                throw new Exception("Invalid product IDs: " . implode(', ', $invalidProductIds));
            }
            $stmt = $pdo->prepare("INSERT INTO orders (created_at) VALUES (NOW())");
            $stmt->execute();
            $orderId = $pdo->lastInsertId();
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (order_id, product_id, attributes_json, quantity)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($orderData['products'] as $prod) {
                if (!isset($prod['id'], $prod['quantity'], $prod['originalAttributes'])) {
                    throw new Exception("Missing fields in product data.");
                }
                $attributesJson = $prod['originalAttributes'];
                $itemStmt->execute([
                    $orderId,
                    $prod['id'],
                    $attributesJson,
                    $prod['quantity']
                ]);
            }
            $pdo->commit();
            return [
                'id' => (int)$orderId,
                'status' => 'CREATED'
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw new Exception("Failed to place order: " . $e->getMessage());
        }
    }
}
