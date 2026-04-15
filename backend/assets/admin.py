from django.contrib import admin

from .models import Asset, Assignment, Category, ConditionReport


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('id', 'name')
	search_fields = ('name',)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'serial_number', 'status', 'category')
	list_filter = ('status', 'category')
	search_fields = ('name', 'serial_number')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
	list_display = ('id', 'asset', 'user', 'assigned_at', 'returned_at')
	list_filter = ('assigned_at', 'returned_at')
	search_fields = ('asset__name', 'asset__serial_number', 'user__username')


@admin.register(ConditionReport)
class ConditionReportAdmin(admin.ModelAdmin):
	list_display = ('id', 'asset', 'condition', 'report_date')
	list_filter = ('condition', 'report_date')
	search_fields = ('asset__name', 'asset__serial_number', 'note')
