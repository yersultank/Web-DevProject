from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AssetViewSet, AssignmentCreateView, CategoryViewSet,
    ConditionReportViewSet, DashboardStatsView,
    LoginView, LogoutView, MyAssetsView, RegisterView,
    my_profile, user_profile_admin,          # два FBV
)

router = DefaultRouter()
router.register('assets',  AssetViewSet, basename='asset')
router.register('categories', CategoryViewSet, basename='category')
router.register('condition-reports', ConditionReportViewSet, basename='condition-report')

urlpatterns = [
    # Auth
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),

    # Admin
    path('dashboard/stats/', DashboardStatsView.as_view(),  name='dashboard_stats'),
    path('assignments/', AssignmentCreateView.as_view(), name='assignment_create'),

    # User
    path('my-assets/', MyAssetsView.as_view(), name='my_assets'),
    path('profile/', my_profile, name='my_profile'),          # FBV 1
    path('profile/<int:user_id>/', user_profile_admin, name='user_profile_admin'), # FBV 2

    path('', include(router.urls)),
]