from django.contrib import admin

from .models import Asset, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('id', 'name')
	search_fields = ('name',)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'serial_number', 'status', 'category')
	list_filter = ('status', 'category')
	search_fields = ('name', 'serial_number')
