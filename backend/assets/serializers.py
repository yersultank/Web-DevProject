from rest_framework import serializers

from .models import Asset, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


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


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
