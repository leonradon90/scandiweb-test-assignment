<?php

namespace App\Models;

class AttributeFactory
{
    public static function createAttribute($data): AbstractAttribute
    {
        if ($data['attribute_type'] === 'swatch') {
            return new ColorAttribute($data);
        } else {
            return new SizeAttribute($data);
        }
    }
}
