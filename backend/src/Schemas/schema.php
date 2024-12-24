<?php

use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Schema;
use App\Resolvers\QueryResolver;
use App\Resolvers\MutationResolver;
use App\Models\AbstractProduct;
use App\Models\AbstractAttribute;

$queryResolver = new QueryResolver();
$mutationResolver = new MutationResolver();

$attributeItemType = new ObjectType([
    'name' => 'AttributeItem',
    'fields' => [
        'display_value' => Type::string(),
        'value' => Type::string(),
    ],
]);

$attributeType = new ObjectType([
    'name' => 'Attribute',
    'fields' => [
        'name' => Type::string(),
        'type' => Type::string(),
        'items' => Type::listOf($attributeItemType),
    ],
]);

$productType = new ObjectType([
    'name' => 'Product',
    'fields' => [
        'id' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getId();
            }
        ],
        'name' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getName();
            }
        ],
        'price' => [
            'type' => Type::float(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getPrice();
            }
        ],
        'inStock' => [
            'type' => Type::boolean(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getInStock();
            }
        ],
        'description' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getDescription();
            }
        ],
        'mainImage' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getMainImage();
            }
        ],
        'brand' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getBrand();
            }
        ],
        'gallery' => [
            'type' => Type::listOf(Type::string()),
            'resolve' => function (AbstractProduct $product) {
                return $product->getGallery();
            }
        ],
        'attributes' => [
            'type' => Type::listOf($attributeType),
            'resolve' => function (AbstractProduct $product) {
                $attrs = $product->getAttributes();
                $formatted = [];
                foreach ($attrs as $a) {
                    $formatted[] = [
                        'name' => $a->getName(),
                        'type' => $a->getType(),
                        'items' => $a->getItems(),
                    ];
                }
                return $formatted;
            }
        ],
        'category' => [
            'type' => Type::string(),
            'resolve' => function (AbstractProduct $product) {
                return $product->getCategory();
            }
        ],
    ],
]);

$categoryType = new ObjectType([
    'name' => 'Category',
    'fields' => [
        'id' => Type::id(),
        'name' => Type::string(),
    ],
]);

$orderType = new ObjectType([
    'name' => 'Order',
    'fields' => [
        'id' => Type::id(),
        'status' => Type::string(),
    ],
]);

$graphQLAttributesInput = new InputObjectType([
    'name' => 'GraphQLAttributesInput',
    'fields' => [
        'Color' => Type::string(),
        'Size' => Type::string(),
        'Capacity' => Type::string(),
        'withUsb3Ports' => Type::string(),
        'touchIdInKeyboard' => Type::string(),
    ],
]);

$orderProductInput = new InputObjectType([
    'name' => 'OrderProductInput',
    'fields' => [
        'id' => Type::nonNull(Type::string()),
        'quantity' => Type::nonNull(Type::int()),
        'originalAttributes' => Type::string(),
        'graphQLAttributes' => $graphQLAttributesInput,
    ],
]);

$orderInput = new InputObjectType([
    'name' => 'OrderInput',
    'fields' => [
        'products' => Type::nonNull(Type::listOf($orderProductInput)),
    ],
]);

$queryType = new ObjectType([
    'name' => 'Query',
    'fields' => [
        'categories' => [
            'type' => Type::listOf($categoryType),
            'resolve' => [$queryResolver, 'categories'],
        ],
        'category' => [
            'type' => $categoryType,
            'args' => [
                'name' => Type::string(),
            ],
            'resolve' => [$queryResolver, 'category'],
        ],
        'products' => [
            'type' => Type::listOf($productType),
            'args' => [
                'category_name' => Type::nonNull(Type::string()),
            ],
            'resolve' => [$queryResolver, 'products'],
        ],
        'product' => [
            'type' => $productType,
            'args' => [
                'id' => Type::nonNull(Type::string()),
            ],
            'resolve' => [$queryResolver, 'product'],
        ],
    ],
]);

$mutationType = new ObjectType([
    'name' => 'Mutation',
    'fields' => [
        'placeOrder' => [
            'type' => $orderType,
            'args' => [
                'order' => Type::nonNull($orderInput),
            ],
            'resolve' => [$mutationResolver, 'placeOrder'],
        ],
    ],
]);

return new Schema([
    'query' => $queryType,
    'mutation' => $mutationType,
]);
