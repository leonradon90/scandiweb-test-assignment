<?php

namespace App\Controller;
require __DIR__ . '/../../bootstrap.php';

use GraphQL\GraphQL as GraphQLBase;

class GraphQL {
    public static function handle() {
        $schema = require __DIR__ . '/../../src/Schemas/schema.php';
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        $query = $input['query'] ?? '';
        $variableValues = $input['variables'] ?? null;
        try {
            $result = GraphQLBase::executeQuery($schema, $query, null, null, $variableValues);
            $output = $result->toArray();
        } catch (\Exception $e) {
            $output = [
                'errors' => [['message' => $e->getMessage()]]
            ];
        }
        header('Content-Type: application/json');
        return json_encode($output);
    }
}
