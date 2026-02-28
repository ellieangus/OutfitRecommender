from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ClothingItem, Outfit

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'style_preferences', 'profile_photo']
        read_only_fields = ['id', 'username', 'email']


class ClothingItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ClothingItem
        fields = [
            'id', 'image', 'image_url', 'source', 'category',
            'ai_attributes', 'user_tags', 'notes', 'is_favorite', 'created_at',
        ]
        read_only_fields = ['id', 'ai_attributes', 'created_at', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class OutfitSerializer(serializers.ModelSerializer):
    clothing_items = ClothingItemSerializer(many=True, read_only=True)
    clothing_item_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ClothingItem.objects.all(),
        write_only=True,
        source='clothing_items',
        required=False,
    )

    class Meta:
        model = Outfit
        fields = [
            'id', 'name', 'occasion_tag', 'clothing_items', 'clothing_item_ids',
            'rating', 'is_favorite', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
