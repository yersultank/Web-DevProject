from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Asset, Assignment, Category, ConditionReport, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'AssetOS Profile Info'
    fields = ('full_name', 'phone', 'department', 'position', 'office_address')

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Access Status', {'fields': ('is_active', 'is_staff')}),
    )
    
    list_display = ('username', 'get_full_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    
    def get_full_name(self, obj):
        return getattr(obj.profile, 'full_name', '—')
    get_full_name.short_description = 'Full Name'

# Перерегистрация стандартной модели User
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

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