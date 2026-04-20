from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth.models import User
from .models import Asset, Assignment, Category, ConditionReport, UserProfile
from .serializers import (
    AssetDetailSerializer, AssetSerializer,
    AssignmentCreateSerializer, AuthTokenObtainPairSerializer,
    CategorySerializer, ConditionReportSerializer,
    DashboardStatsSerializer, LogoutSerializer,
    MyAssetSerializer, UserRegisterSerializer,
    UserProfileSerializer, UserProfileAdminSerializer,
)


# ── CBV ───────────────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class   = AuthTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data['refresh']).blacklist()
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Logout successful.'})


class AssetViewSet(viewsets.ModelViewSet):
    queryset = (
        Asset.objects
        .select_related('category')
        .prefetch_related('assignments__user', 'condition_reports')
        .order_by('id')
    )
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        return AssetDetailSerializer if self.action == 'retrieve' else AssetSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Category.objects.all().order_by('name')
    serializer_class   = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ConditionReportViewSet(viewsets.ModelViewSet):
    queryset           = ConditionReport.objects.select_related('asset').order_by('-report_date')
    serializer_class   = ConditionReportSerializer
    permission_classes = [permissions.IsAdminUser]


class AssignmentCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = AssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        assignment.asset.status = Asset.Status.ASSIGNED
        assignment.asset.save(update_fields=['status', 'updated_at'])
        return Response(AssignmentCreateSerializer(assignment).data, status=status.HTTP_201_CREATED)


class MyAssetsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        assignments = (
            Assignment.objects
            .select_related('asset', 'asset__category')
            .filter(user=request.user, returned_at__isnull=True)
            .order_by('-assigned_at')
        )
        return Response(MyAssetSerializer(assignments, many=True).data)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        counts = {e['status']: e['count'] for e in Asset.objects.values('status').annotate(count=Count('id'))}
        payload = {
            'total':       Asset.objects.count(),
            'assigned':    counts.get(Asset.Status.ASSIGNED, 0),
            'available':   counts.get(Asset.Status.AVAILABLE, 0),
            'maintenance': counts.get(Asset.Status.MAINTENANCE, 0),
            'retired':     counts.get(Asset.Status.RETIRED, 0),
        }
        return Response(DashboardStatsSerializer(payload).data)


class RegisterView(viewsets.generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


# ── FBV 1: собственный профиль (GET = просмотр, PUT = редактирование) ─────────
@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    # get_or_create — создаёт профиль если его ещё нет, привязывает к request.user
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserProfileSerializer(profile).data)

    # PUT — обновляем только переданные поля (partial=True)
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ── FBV 2: профиль пользователя для администратора (с его ассетами) ──────────
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def user_profile_admin(request, user_id):
    user    = get_object_or_404(User, pk=user_id)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return Response(UserProfileAdminSerializer(profile).data)