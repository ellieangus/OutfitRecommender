from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/logout/', views.LogoutView.as_view()),

    # User profile
    path('user/profile/', views.UserProfileView.as_view()),

    # Wardrobe
    path('wardrobe/', views.ClothingItemListView.as_view()),
    path('wardrobe/upload/', views.UploadClothingView.as_view()),
    path('wardrobe/add-text/', views.AddTextAccessoryView.as_view()),
    path('wardrobe/<int:pk>/', views.ClothingItemDetailView.as_view()),

    # Outfits
    path('outfits/', views.OutfitListView.as_view()),
    path('outfits/generate/', views.GenerateOutfitView.as_view()),
    path('outfits/<int:pk>/', views.OutfitDetailView.as_view()),

    # Shopping tab
    path('shopping/analyze/', views.ShoppingAnalyzeView.as_view()),
]
