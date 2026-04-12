from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import Asset
from .serializers import AssetSerializer, LogoutSerializer


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
	queryset = Asset.objects.select_related('category').all().order_by('id')
	serializer_class = AssetSerializer
	permission_classes = [permissions.IsAdminUser]
