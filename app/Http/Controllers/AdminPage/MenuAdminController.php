<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\MenuModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MenuAdminController extends Controller
{
    public function index()
    {
        $viewData = MenuModel::all();

        return Inertia::render('Admin/Menu/index', [
            'menuItems' => $viewData,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Menu/create');
    }

    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::slug($validatedData['name']).'-'.Str::uuid().'.'.$image->extension();
            $validatedData['image'] = $image->storeAs('menus', $filename, 'public');
        }

        $menuItem = MenuModel::create($validatedData);

        // Redirect to the menu index page with a success message
        return redirect()->route('admin.menu.index')->with('success', 'Menu item created successfully.');
    }

    public function edit($id)
    {
        $menuItem = MenuModel::findOrFail($id);

        return Inertia::render('Admin/Menu/edit', [
            'menuItem' => $menuItem,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $menuItem = MenuModel::findOrFail($id);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::slug($validatedData['name']).'-'.Str::uuid().'.'.$image->extension();
            $validatedData['image'] = $image->storeAs('menus', $filename, 'public');

            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
        } else {
            unset($validatedData['image']);
        }

        $menuItem->update($validatedData);

        // Redirect to the menu index page with a success message
        return redirect()->route('admin.menu.index')->with('success', 'Menu item updated successfully.');
    }

    public function destroy($id)
    {
        $menuItem = MenuModel::findOrFail($id);

        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return redirect()->route('admin.menu.index')->with('success', 'Menu item deleted successfully.');
    }
}
