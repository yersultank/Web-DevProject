from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category


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
				'name': 'Dell XPS 13',
				'serial_number': 'DX13-0001',
				'status': 'available',
				'category': self.category.id,
			},
			format='json',
		)
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

		list_response = self.client.get(reverse('asset-list'))
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)

	def test_employee_cannot_access_assets(self):
		token = self._login_and_get_access('employee', 'employeepass123')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

		response = self.client.get(reverse('asset-list'))
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
