from django.db.models import Count
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import Asset, Assignment, Category, ConditionReport
from .serializers import (
	AssetDetailSerializer,
	AssetSerializer,
	AssignmentCreateSerializer,
	AuthTokenObtainPairSerializer,
	CategorySerializer,
	ConditionReportSerializer,
	DashboardStatsSerializer,
	LogoutSerializer,
	MyAssetSerializer,
)


class LoginView(TokenObtainPairView):
	permission_classes = [permissions.AllowAny]
	serializer_class = AuthTokenObtainPairSerializer


class LogoutView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		serializer = LogoutSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		try:
			token = RefreshToken(serializer.validated_data['refresh'])
			token.blacklist()
		except TokenError:
			return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

		return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)


class AssetViewSet(viewsets.ModelViewSet):
	queryset = Asset.objects.select_related('category').prefetch_related('assignments__user', 'condition_reports').all().order_by('id')
	serializer_class = AssetSerializer
	permission_classes = [permissions.IsAdminUser]

	def get_serializer_class(self):
		if self.action == 'retrieve':
			return AssetDetailSerializer
		return AssetSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = Category.objects.all().order_by('name')
	serializer_class = CategorySerializer
	permission_classes = [permissions.IsAuthenticated]


class ConditionReportViewSet(viewsets.ModelViewSet):
	queryset = ConditionReport.objects.select_related('asset').all().order_by('-report_date')
	serializer_class = ConditionReportSerializer
	permission_classes = [permissions.IsAdminUser]


class AssignmentCreateView(APIView):
	permission_classes = [permissions.IsAdminUser]

	def post(self, request):
		serializer = AssignmentCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		assignment = serializer.save()

		asset = assignment.asset
		asset.status = Asset.Status.ASSIGNED
		asset.save(update_fields=['status', 'updated_at'])

		return Response(
			AssignmentCreateSerializer(assignment).data,
			status=status.HTTP_201_CREATED,
		)


class MyAssetsView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		assignments = (
			Assignment.objects.select_related('asset', 'asset__category')
			.filter(user=request.user, returned_at__isnull=True)
			.order_by('-assigned_at')
		)
		serializer = MyAssetSerializer(assignments, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
	permission_classes = [permissions.IsAdminUser]

	def get(self, request):
		status_counts = Asset.objects.values('status').annotate(count=Count('id'))
		counts_by_status = {entry['status']: entry['count'] for entry in status_counts}

		payload = {
			'total': Asset.objects.count(),
			'assigned': counts_by_status.get(Asset.Status.ASSIGNED, 0),
			'available': counts_by_status.get(Asset.Status.AVAILABLE, 0),
			'maintenance': counts_by_status.get(Asset.Status.MAINTENANCE, 0),
			'retired': counts_by_status.get(Asset.Status.RETIRED, 0),
		}

		serializer = DashboardStatsSerializer(payload)
		return Response(serializer.data, status=status.HTTP_200_OK)
