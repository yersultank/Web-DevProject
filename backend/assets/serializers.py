from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Asset, Assignment, Category, ConditionReport, UserProfile


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
    assignments   = AssignmentHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = Asset
        fields = (
            'id', 'name', 'description', 'image',
            'serial_number', 'status',
            'category', 'category_name',
            'assignments', 'created_at', 'updated_at',
        )


class AssetDetailSerializer(AssetSerializer):
    condition_reports = ConditionReportSerializer(many=True, read_only=True)

    class Meta(AssetSerializer.Meta):
        fields = AssetSerializer.Meta.fields + ('condition_reports',)


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Assignment
        fields = ('id', 'asset', 'user', 'assigned_at', 'notes')

    def validate(self, attrs):
        if attrs['asset'].assignments.filter(returned_at__isnull=True).exists():
            raise serializers.ValidationError({'asset': 'Asset is already assigned.'})
        return attrs


# Показывается залогиненному пользователю — его назначенные ассеты
class MyAssetSerializer(serializers.ModelSerializer):
    asset_id      = serializers.IntegerField(source='asset.id',             read_only=True)
    asset_name    = serializers.CharField(source='asset.name',              read_only=True)
    serial_number = serializers.CharField(source='asset.serial_number',     read_only=True)
    status        = serializers.CharField(source='asset.status',            read_only=True)
    category_name = serializers.CharField(source='asset.category.name',     read_only=True)
    image         = serializers.ImageField(source='asset.image',            read_only=True)
    description   = serializers.CharField(source='asset.description',       read_only=True)

    class Meta:
        model  = Assignment
        fields = ('id', 'asset_id', 'asset_name', 'serial_number',
                  'status', 'category_name', 'image', 'description', 'assigned_at', 'notes')


class DashboardStatsSerializer(serializers.Serializer):
    total       = serializers.IntegerField()
    assigned    = serializers.IntegerField()
    available   = serializers.IntegerField()
    maintenance = serializers.IntegerField()
    retired     = serializers.IntegerField()


# Профиль — редактируемые поля пользователя
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model  = UserProfile
        fields = ('id', 'username', 'is_staff', 'phone', 'office_address', 'department', 'position')


# Профиль для просмотра администратором — включает ассеты пользователя
class UserProfileAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    assets   = serializers.SerializerMethodField()

    def get_assets(self, obj):
        assignments = obj.user.asset_assignments.filter(returned_at__isnull=True)
        return MyAssetSerializer(assignments, many=True).data

    class Meta:
        model  = UserProfile
        fields = ('id', 'username', 'phone', 'office_address', 'department', 'position', 'assets')


class AuthTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id':           self.user.id,
            'username':     self.user.username,
            'is_staff':     self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model      = User
        fields     = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)