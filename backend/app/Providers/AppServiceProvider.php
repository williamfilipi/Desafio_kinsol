<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // No custom registrations needed
    }

    public function boot(): void
    {
        // Any app-wide bootstrapping
    }
}