from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Asset, Assignment, Category, ConditionReport


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class AssignmentHistorySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'user', 'user_username', 'assigned_at', 'returned_at', 'notes')


class ConditionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConditionReport
        fields = ('id', 'asset', 'condition', 'note', 'report_date')


class AssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Asset
        fields = (
            'id',
            'name',
            'serial_number',
            'status',
            'category',
            'category_name',
            'created_at',
            'updated_at',
        )


class AssetDetailSerializer(AssetSerializer):
    assignments = AssignmentHistorySerializer(many=True, read_only=True)
    condition_reports = ConditionReportSerializer(many=True, read_only=True)

    class Meta(AssetSerializer.Meta):
        fields = AssetSerializer.Meta.fields + ('assignments', 'condition_reports')


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ('id', 'asset', 'user', 'assigned_at', 'notes')

    def validate(self, attrs):
        asset = attrs['asset']
        has_active_assignment = asset.assignments.filter(returned_at__isnull=True).exists()

        if has_active_assignment:
            raise serializers.ValidationError({'asset': 'Asset is already assigned.'})

        return attrs


class MyAssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='asset.category.name', read_only=True)
    asset_id = serializers.IntegerField(source='asset.id', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    serial_number = serializers.CharField(source='asset.serial_number', read_only=True)
    status = serializers.CharField(source='asset.status', read_only=True)

    class Meta:
        model = Assignment
        fields = (
            'id',
            'asset_id',
            'asset_name',
            'serial_number',
            'status',
            'category_name',
            'assigned_at',
            'notes',
        )


class DashboardStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    assigned = serializers.IntegerField()
    available = serializers.IntegerField()
    maintenance = serializers.IntegerField()
    retired = serializers.IntegerField()


class AuthTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
