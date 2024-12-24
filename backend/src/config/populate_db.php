<?php
require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->load();

$dbHost = $_ENV['DB_HOST'];
$dbName = $_ENV['DB_NAME'];
$dbUser = $_ENV['DB_USER'];
$dbPass = $_ENV['DB_PASS'];
$dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
$pdo = new PDO($dsn, $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$data = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
if (!$data) {
    die("Error loading data.json\n");
}

$categories = $data['data']['categories'];
$products = $data['data']['products'];

try {
    $pdo->beginTransaction();
    $catStmt = $pdo->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
    foreach ($categories as $cat) {
        $catStmt->execute([$cat['name']]);
    }

    $prodStmt = $pdo->prepare("
        INSERT IGNORE INTO products (product_id, name, in_stock, category, description, brand, main_image, price)
        VALUES (?,?,?,?,?,?,?,?)
    ");
    $galStmt = $pdo->prepare("INSERT INTO galleries (product_id, image_url) VALUES (?, ?)");
    $attrStmt = $pdo->prepare("INSERT INTO attributes (product_id, attribute_name, attribute_type) VALUES (?, ?, ?)");
    $attrItemStmt = $pdo->prepare("INSERT INTO attribute_items (attribute_id, display_value, value) VALUES (?,?,?)");
    $selectProdIdStmt = $pdo->prepare("SELECT id FROM products WHERE product_id = ? LIMIT 1");
    $selectAttrIdStmt = $pdo->prepare("SELECT id FROM attributes WHERE product_id = ? AND attribute_name = ? LIMIT 1");

    foreach ($products as $p) {
        $productId = $p['id'];
        $name = $p['name'];
        $inStock = $p['inStock'] ? 1 : 0;
        $categoryName = $p['category'];
        $description = $p['description'];
        $brand = $p['brand'] ?? '';
        $mainImage = isset($p['gallery'][0]) ? $p['gallery'][0] : '';
        $price = 0.00;
        if (!empty($p['prices'])) {
            $price = $p['prices'][0]['amount'] ?? 0.00;
        }
        $prodStmt->execute([$productId, $name, $inStock, $categoryName, $description, $brand, $mainImage, $price]);
        $selectProdIdStmt->execute([$productId]);
        $dbProduct = $selectProdIdStmt->fetch(PDO::FETCH_ASSOC);
        if (!$dbProduct) {
            continue;
        }
        $dbProductId = $dbProduct['id'];
        if (!empty($p['gallery'])) {
            foreach ($p['gallery'] as $imgUrl) {
                $galStmt->execute([$dbProductId, $imgUrl]);
            }
        }
        if (!empty($p['attributes'])) {
            foreach ($p['attributes'] as $attr) {
                $attrName = $attr['id'];
                $attrType = $attr['type'];
                $attrStmt->execute([$dbProductId, $attrName, $attrType]);
                $selectAttrIdStmt->execute([$dbProductId, $attrName]);
                $dbAttr = $selectAttrIdStmt->fetch(PDO::FETCH_ASSOC);
                if (!$dbAttr) continue;
                $dbAttrId = $dbAttr['id'];
                foreach ($attr['items'] as $item) {
                    $displayValue = $item['displayValue'];
                    $val = $item['value'];
                    $attrItemStmt->execute([$dbAttrId, $displayValue, $val]);
                }
            }
        }
    }

    $pdo->commit();
    echo "Database populated successfully.\n";
} catch (Exception $e) {
    $pdo->rollBack();
    echo "Failed to populate database: " . $e->getMessage() . "\n";
}
