from django.urls import path, include
from rest_framework.routers import DefaultRouter
from assets.views import (
    LoginView, LogoutView, RegisterView,
    AssetViewSet, CategoryViewSet, ConditionReportViewSet,
    AssignmentCreateView, MyAssetsView,
    DashboardStatsView, ReturnAssetView,
    my_profile, user_profile_admin, user_list, asset_history, my_asset_history
)

router = DefaultRouter()
router.register('assets', AssetViewSet, basename='asset')
router.register('categories', CategoryViewSet, basename='category')
router.register('condition-reports', ConditionReportViewSet, basename='condition-report')

urlpatterns = [
    path('', include(router.urls)),
    path('token/',        LoginView.as_view(),             name='token-obtain'),
    path('logout/',       LogoutView.as_view(),            name='logout'),
    path('register/',     RegisterView.as_view(),          name='register'),
    path('my-assets/',    MyAssetsView.as_view(),          name='my-assets'),
    path('assign/',       AssignmentCreateView.as_view(),  name='assign'),
    path('dashboard/',    DashboardStatsView.as_view(),    name='dashboard-stats'),
    path('profile/',      my_profile,                      name='my-profile'),
    path('users/<int:user_id>/profile/', user_profile_admin, name='user-profile-admin'),
    path('assignments/<int:assignment_id>/return/', ReturnAssetView.as_view(), name='return-asset'),
    path('users/',        user_list,                       name='user-list'),
    path('history/',      asset_history,                   name='asset-history'),
    path('my-history/',   my_asset_history,                name='my-asset-history'),
]
