<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            // Colunas básicas
            $table->id(); // Chave primária auto-incremento
            
            $table->string('name'); // Nome do produto (VARCHAR 255)
            $table->text('description')->nullable(); // Descrição (texto será opcional)
            
            // Armazenamento da imagem BLOB
            $table->binary('image')->nullable(); // Imagem em formato binário (BLOB)
            $table->string('image_mime_type')->nullable(); // Tipo MIME da imagem (ex: image/jpeg)
            $table->integer('image_size')->nullable(); // Tamanho da imagem em bytes
            
            // Relacionamentos
            $table->unsignedBigInteger('category_id'); // Chave estrangeira para categorias
            $table->unsignedBigInteger('user_id'); // Usuário que cadastrou o produto
            
            // Preços
            $table->decimal('purchase_price', 10, 2); // Preço de compra (DECIMAL 10,2)
            $table->decimal('sale_price', 10, 2); // Preço de venda (DECIMAL 10,2)
            
            // Timestamps
            $table->timestamps(); // created_at e updated_at
            
            // Chaves estrangeiras
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}