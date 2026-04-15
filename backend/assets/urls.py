from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AssetViewSet,
    AssignmentCreateView,
    CategoryViewSet,
    ConditionReportViewSet,
    DashboardStatsView,
    LoginView,
    LogoutView,
    MyAssetsView,
)

router = DefaultRouter()
router.register('assets', AssetViewSet, basename='asset')
router.register('categories', CategoryViewSet, basename='category')
router.register('condition-reports', ConditionReportViewSet, basename='condition-report')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('my-assets/', MyAssetsView.as_view(), name='my_assets'),
    path('assignments/', AssignmentCreateView.as_view(), name='assignment_create'),
    path('', include(router.urls)),
]
