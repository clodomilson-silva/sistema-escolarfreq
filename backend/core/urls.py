from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    login_view,
    register_view,
    me_view,
    verify_token_view,
    UserListView
)

urlpatterns = [
    # JWT token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Auth endpoints
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('me/', me_view, name='me'),
    path('verify/', verify_token_view, name='verify'),
    
    # User management
    path('users/', UserListView.as_view(), name='user-list'),
]
