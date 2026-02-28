import os
import tempfile

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .claude_api import (
    analyze_clothing_image,
    analyze_clothing_text,
    analyze_shopping_pairings,
    generate_outfit,
)
from .models import ClothingItem, Outfit
from .serializers import (
    ClothingItemSerializer,
    OutfitSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': RegisterSerializer(user).data}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(ObtainAuthToken):
    """POST username + password → returns token."""

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.pk, 'username': user.username})


class LogoutView(APIView):
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=204)


# ---------------------------------------------------------------------------
# User Profile
# ---------------------------------------------------------------------------

class UserProfileView(APIView):
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ---------------------------------------------------------------------------
# Wardrobe — list + upload
# ---------------------------------------------------------------------------

class ClothingItemListView(APIView):
    def get(self, request):
        items = ClothingItem.objects.filter(user=request.user)

        # Optional filtering by category or tag
        category = request.query_params.get('category')
        tag = request.query_params.get('tag')
        favorites_only = request.query_params.get('favorites') == 'true'

        if category:
            items = items.filter(category=category)
        if tag:
            # user_tags is a JSON array; filter items where the array contains the tag
            items = [i for i in items if tag in (i.user_tags or [])]
        if favorites_only:
            items = items.filter(is_favorite=True) if not tag else [i for i in items if i.is_favorite]

        serializer = ClothingItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)


class UploadClothingView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=400)

        category = request.data.get('category', 'other')
        notes = request.data.get('notes', '')

        item = ClothingItem(
            user=request.user,
            image=image,
            source='photo',
            category=category,
            notes=notes,
        )
        item.save()

        # Run AI analysis — skip if attributes already exist (idempotent)
        if not item.ai_attributes:
            try:
                attrs = analyze_clothing_image(item.image.path)
                item.ai_attributes = attrs
                item.save()
            except Exception as e:
                # Return item even if AI fails; caller can retry
                item.ai_attributes = {'error': str(e)}
                item.save()

        serializer = ClothingItemSerializer(item, context={'request': request})
        return Response(serializer.data, status=201)


class AddTextAccessoryView(APIView):
    def post(self, request):
        description = request.data.get('description', '').strip()
        category = request.data.get('category', 'other')
        notes = request.data.get('notes', '')

        if not description:
            return Response({'error': 'description is required'}, status=400)

        item = ClothingItem(
            user=request.user,
            source='text',
            category=category,
            notes=notes,
        )
        item.save()

        try:
            attrs = analyze_clothing_text(description, category)
            item.ai_attributes = attrs
            item.save()
        except Exception as e:
            item.ai_attributes = {'error': str(e), 'raw_description': description}
            item.save()

        serializer = ClothingItemSerializer(item, context={'request': request})
        return Response(serializer.data, status=201)


class ClothingItemDetailView(APIView):
    def _get_item(self, pk, user):
        try:
            return ClothingItem.objects.get(pk=pk, user=user)
        except ClothingItem.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self._get_item(pk, request.user)
        if not item:
            return Response(status=404)
        return Response(ClothingItemSerializer(item, context={'request': request}).data)

    def patch(self, request, pk):
        item = self._get_item(pk, request.user)
        if not item:
            return Response(status=404)
        serializer = ClothingItemSerializer(
            item, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = self._get_item(pk, request.user)
        if not item:
            return Response(status=404)
        # Remove image file from disk too
        if item.image:
            try:
                os.remove(item.image.path)
            except OSError:
                pass
        item.delete()
        return Response(status=204)


# ---------------------------------------------------------------------------
# Outfit Generator
# ---------------------------------------------------------------------------

class GenerateOutfitView(APIView):
    def post(self, request):
        occasion = request.data.get('occasion', 'casual')
        wardrobe_items = ClothingItem.objects.filter(user=request.user)

        if not wardrobe_items.exists():
            return Response({'error': 'Your wardrobe is empty. Add some items first!'}, status=400)

        try:
            result = generate_outfit(occasion, wardrobe_items)
        except Exception as e:
            return Response({'error': f'AI error: {e}'}, status=500)

        selected_ids = result.get('selected_item_ids', [])
        selected_items = ClothingItem.objects.filter(id__in=selected_ids, user=request.user)

        # Auto-save the generated outfit
        outfit = Outfit.objects.create(
            user=request.user,
            name=result.get('outfit_name', f'{occasion.title()} Outfit'),
            occasion_tag=occasion,
            notes=result.get('reasoning', ''),
        )
        outfit.clothing_items.set(selected_items)

        return Response({
            'outfit': OutfitSerializer(outfit, context={'request': request}).data,
            'reasoning': result.get('reasoning', ''),
        }, status=201)


# ---------------------------------------------------------------------------
# Outfit CRUD
# ---------------------------------------------------------------------------

class OutfitListView(APIView):
    def get(self, request):
        outfits = Outfit.objects.filter(user=request.user)
        occasion = request.query_params.get('occasion')
        favorites_only = request.query_params.get('favorites') == 'true'
        if occasion:
            outfits = outfits.filter(occasion_tag=occasion)
        if favorites_only:
            outfits = outfits.filter(is_favorite=True)
        return Response(OutfitSerializer(outfits, many=True, context={'request': request}).data)

    def post(self, request):
        """Manually save an outfit (e.g. from the frontend after user tweaks a generated one)."""
        clothing_ids = request.data.get('clothing_item_ids', [])
        outfit = Outfit.objects.create(
            user=request.user,
            name=request.data.get('name', 'My Outfit'),
            occasion_tag=request.data.get('occasion_tag', 'casual'),
            notes=request.data.get('notes', ''),
        )
        items = ClothingItem.objects.filter(id__in=clothing_ids, user=request.user)
        outfit.clothing_items.set(items)
        return Response(OutfitSerializer(outfit, context={'request': request}).data, status=201)


class OutfitDetailView(APIView):
    def _get_outfit(self, pk, user):
        try:
            return Outfit.objects.get(pk=pk, user=user)
        except Outfit.DoesNotExist:
            return None

    def get(self, request, pk):
        outfit = self._get_outfit(pk, request.user)
        if not outfit:
            return Response(status=404)
        return Response(OutfitSerializer(outfit, context={'request': request}).data)

    def patch(self, request, pk):
        outfit = self._get_outfit(pk, request.user)
        if not outfit:
            return Response(status=404)
        # Allow updating name, occasion_tag, rating, is_favorite, notes
        allowed = ['name', 'occasion_tag', 'rating', 'is_favorite', 'notes']
        for field in allowed:
            if field in request.data:
                setattr(outfit, field, request.data[field])
        outfit.save()
        return Response(OutfitSerializer(outfit, context={'request': request}).data)

    def delete(self, request, pk):
        outfit = self._get_outfit(pk, request.user)
        if not outfit:
            return Response(status=404)
        outfit.delete()
        return Response(status=204)


# ---------------------------------------------------------------------------
# Shopping Tab
# ---------------------------------------------------------------------------

class ShoppingAnalyzeView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=400)

        wardrobe_items = ClothingItem.objects.filter(user=request.user)
        if not wardrobe_items.exists():
            return Response({'error': 'Your wardrobe is empty. Add some items first!'}, status=400)

        # Write to a temp file so claude_api can read it by path
        suffix = os.path.splitext(image.name)[1] or '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in image.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            shopping_attrs = analyze_clothing_image(tmp_path)
            pairings = analyze_shopping_pairings(shopping_attrs, wardrobe_items)
        except Exception as e:
            return Response({'error': f'AI error: {e}'}, status=500)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

        # Collect the paired wardrobe items for each suggested outfit
        all_ids = set()
        for outfit in pairings.get('outfits', []):
            all_ids.update(outfit.get('selected_item_ids', []))

        paired_items = ClothingItem.objects.filter(id__in=all_ids, user=request.user)
        paired_map = {item.id: item for item in paired_items}

        # Enrich outfits with serialized item data
        enriched_outfits = []
        for outfit in pairings.get('outfits', []):
            items = [paired_map[i] for i in outfit.get('selected_item_ids', []) if i in paired_map]
            enriched_outfits.append({
                **outfit,
                'items': ClothingItemSerializer(items, many=True, context={'request': request}).data,
            })

        return Response({
            'shopping_item_attributes': shopping_attrs,
            'overall_verdict': pairings.get('overall_verdict', ''),
            'outfits': enriched_outfits,
        })
