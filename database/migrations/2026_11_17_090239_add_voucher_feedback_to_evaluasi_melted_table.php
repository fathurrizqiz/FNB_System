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
        Schema::table('evaluasi_melted', function (Blueprint $table) {
            $table->foreignId('menu_id')->nullable()->constrained('Menu')->nullOnDelete();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->foreignId('voucher_id')->nullable()->unique()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluasi_melted', function (Blueprint $table) {
            $table->dropConstrainedForeignId('voucher_id');
            $table->dropConstrainedForeignId('menu_id');
            $table->dropColumn('rating');
        });
    }
};
