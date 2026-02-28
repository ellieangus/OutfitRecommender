from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    style_preferences = models.JSONField(default=dict, blank=True)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.username


class ClothingItem(models.Model):
    SOURCE_CHOICES = [
        ('photo', 'Photo'),
        ('text', 'Text'),
    ]
    CATEGORY_CHOICES = [
        ('top', 'Top'),
        ('bottom', 'Bottom'),
        ('shoes', 'Shoes'),
        ('jewelry', 'Jewelry'),
        ('socks', 'Socks'),
        ('bag', 'Bag'),
        ('hat', 'Hat'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clothing_items')
    image = models.ImageField(upload_to='clothing/', null=True, blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    ai_attributes = models.JSONField(default=dict, blank=True)
    user_tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        category = self.get_category_display()
        ai_type = self.ai_attributes.get('type', '')
        return f"{category}: {ai_type}" if ai_type else category


class Outfit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outfits')
    name = models.CharField(max_length=200)
    occasion_tag = models.CharField(max_length=100)
    clothing_items = models.ManyToManyField(ClothingItem, blank=True, related_name='outfits')
    rating = models.IntegerField(null=True, blank=True)
    is_favorite = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.occasion_tag})"
