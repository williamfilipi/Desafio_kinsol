<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;


class Product extends Model
{
    protected $table = 'tbprodutos'; // Mantendo seu nome de tabela personalizado
    
    // Campos que podem ser preenchidos em massa
    protected $fillable = [
        'name', 
        'description', 
        'image', 
        'image_mime_type', 
        'image_size',
        'category_id', 
        'purchase_price', 
        'sale_price', 
        'user_id',
        'created_at',
        'updated_at'
    ];
    
    // Mutator para processar e comprimir a imagem ao salvar
    public function setImageAttribute($file)
    {
    if (!$file) {
        $this->attributes['image'] = null;
        $this->attributes['image_mime_type'] = null;
        $this->attributes['image_size'] = null;
        return;
    }

    //comprime a imagem
    $compressedImage = Image::read($file)
        ->resize(800, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        })
        ->toJpeg(75); // Qualidade de 75% jpeg

        //Salva no banco BLOB
        $this->attributes['image'] = $compressedImage;
        $this->attributes['image_mime_type'] = 'image/jpeg';
        $this->attributes['image_size'] = $compressedImage->size();
    }
    
    // Acessor para recuperar a imagem como base64
    public function getImageAttribute($value)
    {
        if (!$value) return null;
        return 'data:' . $this->image_mime_type . ';base64,' . base64_encode($value);
    }
    
    // Relacionamento com a tabela de categorias
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
    
    // Relacionamento com a tabela de usuários
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}