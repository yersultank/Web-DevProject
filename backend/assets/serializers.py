from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Asset, Assignment, Category, ConditionReport, StatusLog, UserProfile


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


class DashboardStatsSerializer(serializers.Serializer):
    total       = serializers.IntegerField()
    assigned    = serializers.IntegerField()
    available   = serializers.IntegerField()
    maintenance = serializers.IntegerField()
    retired     = serializers.IntegerField()


class AssignmentCreateSerializer(serializers.Serializer):
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    user  = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_active=True))
    notes = serializers.CharField(allow_blank=True, required=False, default='')

    def validate_asset(self, asset):
        if asset.status != Asset.Status.AVAILABLE:
            raise serializers.ValidationError('Asset is not available for assignment.')
        return asset

    def create(self, validated_data):
        asset = validated_data['asset']
        assignment = Assignment.objects.create(
            asset=asset,
            user=validated_data['user'],
            notes=validated_data.get('notes', ''),
        )
        asset.status = Asset.Status.ASSIGNED
        asset.save(update_fields=['status', 'updated_at'])
        return assignment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ('id', 'name')


class ConditionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConditionReport
        fields = ('id', 'asset', 'condition', 'note', 'report_date')


class AssignmentHistorySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = Assignment
        fields = ('id', 'user', 'username', 'assigned_at', 'returned_at', 'notes')


class AssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    assignee      = serializers.SerializerMethodField()

    class Meta:
        model  = Asset
        fields = (
            'id', 'name', 'description', 'image',
            'serial_number', 'status',
            'category', 'category_name',
            'assignee',
            'created_at', 'updated_at',
        )

    def get_assignee(self, obj):
        active_list = getattr(obj, 'active_assignments', None)
        if active_list is None:
            active_list = list(obj.assignments.filter(returned_at__isnull=True).select_related('user'))
        if active_list:
            a = active_list[0]
            return {'assignment_id': a.id, 'username': a.user.username}
        return None


class AssetDetailSerializer(AssetSerializer):
    assignments       = AssignmentHistorySerializer(many=True, read_only=True)
    condition_reports = ConditionReportSerializer(many=True, read_only=True)

    class Meta(AssetSerializer.Meta):
        fields = AssetSerializer.Meta.fields + ('assignments', 'condition_reports')


class MyAssetSerializer(serializers.ModelSerializer):
    asset_id      = serializers.IntegerField(source='asset.id',          read_only=True)
    asset_name    = serializers.CharField(source='asset.name',           read_only=True)
    serial_number = serializers.CharField(source='asset.serial_number',  read_only=True)
    status        = serializers.CharField(source='asset.status',         read_only=True)
    category_name = serializers.CharField(source='asset.category.name', read_only=True)
    image         = serializers.ImageField(source='asset.image',         read_only=True)
    description   = serializers.CharField(source='asset.description',   read_only=True, allow_null=True)

    class Meta:
        model  = Assignment
        fields = ('id', 'asset_id', 'asset_name', 'serial_number',
                  'status', 'category_name', 'image', 'description',
                  'assigned_at', 'notes')


class StatusLogSerializer(serializers.ModelSerializer):
    asset_name  = serializers.CharField(source='asset.name',          read_only=True)
    asset_sn    = serializers.CharField(source='asset.serial_number',  read_only=True)
    assigned_to = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)

    class Meta:
        model  = StatusLog
        fields = ('id', 'asset_id', 'asset_name', 'asset_sn',
                  'from_status', 'to_status', 'changed_at', 'assigned_to', 'notes')


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model  = UserProfile
        fields = ('id', 'username', 'is_staff',
                  'full_name', 'phone', 'office_address', 'department', 'position')


class UserProfileAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    assets   = serializers.SerializerMethodField()

    class Meta:
        model  = UserProfile
        fields = ('id', 'username', 'full_name', 'phone',
                  'office_address', 'department', 'position', 'assets')

    def get_assets(self, obj):
        assignments = obj.user.asset_assignments.filter(returned_at__isnull=True)
        return MyAssetSerializer(assignments, many=True).data


class UserRegisterSerializer(serializers.ModelSerializer):
    full_name      = serializers.CharField(write_only=True)
    phone          = serializers.CharField(write_only=True)
    department     = serializers.CharField(write_only=True)
    position       = serializers.CharField(write_only=True)
    office_address = serializers.CharField(write_only=True)

    class Meta:
        model        = User
        fields       = ('username', 'password', 'full_name', 'phone',
                        'department', 'position', 'office_address')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = {k: validated_data.pop(k)
                        for k in ('full_name', 'phone', 'department', 'position', 'office_address')}
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, **profile_data)
        return user
