<?php

namespace App\Models;

abstract class AbstractAttribute
{
    protected $name;
    protected $type;
    protected $items = [];

    public function getName() { return $this->name; }
    public function getType() { return $this->type; }
    public function getItems() { return $this->items; }
    abstract public function isSwatch(): bool;
}
