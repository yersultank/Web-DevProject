from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth.models import User
from django.utils import timezone

from .models import Asset, Assignment, Category, ConditionReport, StatusLog, UserProfile
from .serializers import (
    AssetSerializer, AssetDetailSerializer,
    AssignmentCreateSerializer, AssignmentHistorySerializer,
    AuthTokenObtainPairSerializer,
    CategorySerializer, ConditionReportSerializer,
    DashboardStatsSerializer, LogoutSerializer,
    MyAssetSerializer, StatusLogSerializer,
    UserProfileSerializer, UserProfileAdminSerializer,
    UserRegisterSerializer,
)


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
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Logged out successfully.'})


class AssetViewSet(viewsets.ModelViewSet):
    queryset = (
        Asset.objects
        .select_related('category')
        .prefetch_related(
            Prefetch(
                'assignments',
                queryset=Assignment.objects.filter(returned_at__isnull=True).select_related('user'),
                to_attr='active_assignments',
            ),
            'condition_reports',
        )
        .order_by('id')
    )
    permission_classes = [permissions.IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        return AssetDetailSerializer if self.action == 'retrieve' else AssetSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        StatusLog.objects.create(
            asset=instance,
            from_status='',
            to_status=instance.status,
        )

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        old_status = instance.status
        status_notes = request.data.get('status_notes', '')

        response = super().update(request, *args, **kwargs)

        instance.refresh_from_db()
        if old_status != instance.status:
            StatusLog.objects.create(
                asset=instance,
                from_status=old_status,
                to_status=instance.status,
                notes=status_notes,
            )
            if old_status == Asset.Status.ASSIGNED:
                instance.close_active_assignments()

        return response


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
        StatusLog.objects.create(
            asset=assignment.asset,
            from_status=Asset.Status.AVAILABLE,
            to_status=Asset.Status.ASSIGNED,
            assigned_to=assignment.user,
        )
        return Response(
            AssignmentHistorySerializer(assignment).data,
            status=status.HTTP_201_CREATED,
        )


class ReturnAssetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, assignment_id):
        assignment = get_object_or_404(
            Assignment,
            pk=assignment_id,
            user=request.user,
            returned_at__isnull=True,
        )
        assignment.returned_at = timezone.now()
        assignment.save(update_fields=['returned_at'])

        asset = assignment.asset
        asset.status = Asset.Status.AVAILABLE
        asset.save(update_fields=['status', 'updated_at'])

        StatusLog.objects.create(
            asset=asset,
            from_status=Asset.Status.ASSIGNED,
            to_status=Asset.Status.AVAILABLE,
        )

        return Response({'detail': 'Asset returned successfully.'}, status=status.HTTP_200_OK)


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


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserProfileSerializer(profile).data)

    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAdminUser])
def user_profile_admin(request, user_id):
    user       = get_object_or_404(User, pk=user_id)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if request.method == 'GET':
        return Response(UserProfileAdminSerializer(profile).data)
    serializer = UserProfileAdminSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def user_list(request):
    users = User.objects.select_related('profile').filter(is_active=True, is_staff=False)
    data = [
        {
            'id':        u.id,
            'username':  u.username,
            'full_name': getattr(getattr(u, 'profile', None), 'full_name', ''),
        }
        for u in users
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_asset_history(request):
    assignments = list(
        Assignment.objects
        .filter(user=request.user)
        .values('asset_id', 'assigned_at', 'returned_at')
    )
    if not assignments:
        return Response([])
    q = Q()
    for a in assignments:
        if a['returned_at']:
            q |= Q(asset_id=a['asset_id'], changed_at__gte=a['assigned_at'], changed_at__lte=a['returned_at'])
        else:
            q |= Q(asset_id=a['asset_id'], changed_at__gte=a['assigned_at'])
    logs = (
        StatusLog.objects
        .filter(q)
        .select_related('asset', 'assigned_to')
        .order_by('-changed_at')
    )
    return Response(StatusLogSerializer(logs, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def asset_history(request):
    asset_id = request.query_params.get('asset')
    qs = (
        StatusLog.objects
        .select_related('asset', 'assigned_to')
        .order_by('-changed_at')
    )
    if asset_id:
        qs = qs.filter(asset_id=asset_id)
    return Response(StatusLogSerializer(qs, many=True).data)
