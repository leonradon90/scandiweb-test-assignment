<?php
require_once __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../bootstrap.php';

use FastRoute\simpleDispatcher;


$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
    $r->post('/graphql', [\App\Controller\GraphQL::class, 'handle']);
});

$routeInfo = $dispatcher->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);

switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:

        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];


        echo $handler($vars);
        break;
}
