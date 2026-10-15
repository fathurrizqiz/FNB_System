<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $columns = [];

        if (! Schema::hasColumn('order_menu', 'order_number')) {
            $columns[] = 'order_number';
        }

        if (! Schema::hasColumn('order_menu', 'customer_name')) {
            $columns[] = 'customer_name';
        }

        if (! Schema::hasColumn('order_menu', 'delivery_method')) {
            $columns[] = 'delivery_method';
        }

        if (! Schema::hasColumn('order_menu', 'notes')) {
            $columns[] = 'notes';
        }

        if (! Schema::hasColumn('order_menu', 'unit_price')) {
            $columns[] = 'unit_price';
        }

        if ($columns !== []) {
            Schema::table('order_menu', function (Blueprint $table) use ($columns): void {
                foreach ($columns as $column) {
                    match ($column) {
                        'order_number' => $table->string($column)->nullable(),
                        'customer_name' => $table->string($column, 120)->nullable(),
                        'delivery_method' => $table->string($column, 100)->nullable(),
                        'notes' => $table->text($column)->nullable(),
                        'unit_price' => $table->decimal($column, 10, 2)->nullable(),
                    };
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = array_filter([
            Schema::hasColumn('order_menu', 'customer_name') ? 'customer_name' : null,
            Schema::hasColumn('order_menu', 'delivery_method') ? 'delivery_method' : null,
            Schema::hasColumn('order_menu', 'notes') ? 'notes' : null,
            Schema::hasColumn('order_menu', 'unit_price') ? 'unit_price' : null,
        ]);

        if ($columns !== []) {
            Schema::table('order_menu', function (Blueprint $table) use ($columns): void {
                $table->dropColumn($columns);
            });
        }
    }
};
