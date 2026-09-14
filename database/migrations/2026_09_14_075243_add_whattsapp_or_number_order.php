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
        if (! Schema::hasColumn('order_menu', 'whatsapp_number')) {
            Schema::table('order_menu', function (Blueprint $table): void {
                $table->string('whatsapp_number')->nullable();
            });
        }

        if (! Schema::hasColumn('order_menu', 'order_number')) {
            Schema::table('order_menu', function (Blueprint $table): void {
                $table->string('order_number')->nullable();
            });
        }

        if (! Schema::hasColumn('order_menu', 'status')) {
            Schema::table('order_menu', function (Blueprint $table): void {
                $table->string('status')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = array_filter([
            Schema::hasColumn('order_menu', 'whatsapp_number') ? 'whatsapp_number' : null,
            Schema::hasColumn('order_menu', 'order_number') ? 'order_number' : null,
            Schema::hasColumn('order_menu', 'status') ? 'status' : null,
        ]);

        if ($columns !== []) {
            Schema::table('order_menu', function (Blueprint $table) use ($columns): void {
                $table->dropColumn($columns);
            });
        }
    }
};
