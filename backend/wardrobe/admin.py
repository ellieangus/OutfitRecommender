from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ClothingItem, Outfit


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Style', {'fields': ('style_preferences', 'profile_photo')}),
    )


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'category', 'source', 'is_favorite', 'created_at']
    list_filter = ['category', 'source', 'is_favorite']
    search_fields = ['user__username', 'notes']
    readonly_fields = ['ai_attributes', 'created_at']


@admin.register(Outfit)
class OutfitAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'occasion_tag', 'rating', 'is_favorite', 'created_at']
    list_filter = ['occasion_tag', 'is_favorite']
    search_fields = ['user__username', 'name']
    filter_horizontal = ['clothing_items']
