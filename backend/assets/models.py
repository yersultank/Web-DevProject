from django.db import models


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
