<?php

namespace App\Models;

abstract class AbstractProduct
{
    protected $id;
    protected $name;
    protected $price;
    protected $inStock;
    protected $description;
    protected $mainImage;
    protected $category;
    protected $brand;

    abstract public function getType(): string;
    abstract public function getAttributes();
    abstract public function getGallery();

    public function getId() { return $this->id; }
    public function getName() { return $this->name; }
    public function getPrice() { return (float)$this->price; }
    public function getInStock() { return $this->inStock; }
    public function getDescription() { return $this->description; }
    public function getMainImage() { return $this->mainImage; }
    public function getCategory() { return $this->category; }
    public function getBrand() { return $this->brand; }
}
