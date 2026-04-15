from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Category(models.Model):
	name = models.CharField(max_length=120, unique=True)

	def __str__(self) -> str:
		return self.name


class Asset(models.Model):
	class Status(models.TextChoices):
		AVAILABLE = 'available', 'Available'
		ASSIGNED = 'assigned', 'Assigned'
		MAINTENANCE = 'maintenance', 'Maintenance'
		RETIRED = 'retired', 'Retired'

	name = models.CharField(max_length=255)
	serial_number = models.CharField(max_length=120, unique=True)
	status = models.CharField(
		max_length=20,
		choices=Status.choices,
		default=Status.AVAILABLE,
	)
	category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='assets')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return f'{self.name} ({self.serial_number})'


class Assignment(models.Model):
	asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='assignments')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='asset_assignments')
	assigned_at = models.DateTimeField(default=timezone.now)
	returned_at = models.DateTimeField(null=True, blank=True)
	notes = models.TextField(blank=True)

	class Meta:
		ordering = ('-assigned_at',)
		constraints = [
			models.UniqueConstraint(
				fields=('asset',),
				condition=Q(returned_at__isnull=True),
				name='unique_active_assignment_per_asset',
			),
		]

	def __str__(self) -> str:
		return f'{self.asset.serial_number} -> {self.user.username}'


class ConditionReport(models.Model):
	class Condition(models.TextChoices):
		GOOD = 'good', 'Good'
		DAMAGED = 'damaged', 'Damaged'
		LOST = 'lost', 'Lost'

	asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='condition_reports')
	condition = models.CharField(max_length=20, choices=Condition.choices)
	note = models.TextField(blank=True)
	report_date = models.DateTimeField(default=timezone.now)

	class Meta:
		ordering = ('-report_date',)

	def __str__(self) -> str:
		return f'{self.asset.serial_number} - {self.condition}'
