from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Asset, Assignment, Category, ConditionReport


class AssetApiTests(APITestCase):
	def setUp(self):
		user_model = get_user_model()
		self.admin_user = user_model.objects.create_user(
			username='admin',
			password='adminpass123',
			is_staff=True,
			is_superuser=True,
		)
		self.employee_user = user_model.objects.create_user(
			username='employee',
			password='employeepass123',
			is_staff=False,
		)
		self.category = Category.objects.create(name='Laptop')
		self.asset = Asset.objects.create(
			name='Dell XPS 13',
			serial_number='DX13-0001',
			status=Asset.Status.AVAILABLE,
			category=self.category,
		)

	def _login_and_get_access(self, username, password):
		response = self.client.post(
			reverse('token_obtain_pair'),
			{'username': username, 'password': password},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		return response.data['access']

	def test_admin_can_create_and_list_assets(self):
		token = self._login_and_get_access('admin', 'adminpass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

		create_response = self.client.post(
			reverse('asset-list'),
			{
				'name': 'MacBook Pro 14',
				'serial_number': 'MBP14-0002',
				'status': 'available',
				'category': self.category.id,
			},
			format='json',
		)
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

		list_response = self.client.get(reverse('asset-list'))
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 2)

	def test_employee_cannot_access_assets(self):
		token = self._login_and_get_access('employee', 'employeepass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

		response = self.client.get(reverse('asset-list'))
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_admin_can_assign_asset_and_employee_sees_my_assets(self):
		admin_token = self._login_and_get_access('admin', 'adminpass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

		assign_response = self.client.post(
			reverse('assignment_create'),
			{
				'asset': self.asset.id,
				'user': self.employee_user.id,
				'notes': 'Checked out for project work',
			},
			format='json',
		)
		self.assertEqual(assign_response.status_code, status.HTTP_201_CREATED)

		self.asset.refresh_from_db()
		self.assertEqual(self.asset.status, Asset.Status.ASSIGNED)

		employee_token = self._login_and_get_access('employee', 'employeepass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {employee_token}')

		my_assets_response = self.client.get(reverse('my_assets'))
		self.assertEqual(my_assets_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(my_assets_response.data), 1)
		self.assertEqual(my_assets_response.data[0]['asset_id'], self.asset.id)

	def test_asset_detail_returns_assignment_and_condition_history(self):
		Assignment.objects.create(asset=self.asset, user=self.employee_user, notes='Assigned to employee')
		ConditionReport.objects.create(
			asset=self.asset,
			condition=ConditionReport.Condition.GOOD,
			note='Initial condition check',
		)

		admin_token = self._login_and_get_access('admin', 'adminpass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

		detail_response = self.client.get(reverse('asset-detail', args=[self.asset.id]))
		self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(detail_response.data['assignments']), 1)
		self.assertEqual(len(detail_response.data['condition_reports']), 1)

	def test_dashboard_stats_endpoint(self):
		Assignment.objects.create(asset=self.asset, user=self.employee_user, notes='Assigned for stats')
		self.asset.status = Asset.Status.ASSIGNED
		self.asset.save(update_fields=['status', 'updated_at'])

		admin_token = self._login_and_get_access('admin', 'adminpass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

		stats_response = self.client.get(reverse('dashboard_stats'))
		self.assertEqual(stats_response.status_code, status.HTTP_200_OK)
		self.assertEqual(stats_response.data['total'], 1)
		self.assertEqual(stats_response.data['assigned'], 1)
