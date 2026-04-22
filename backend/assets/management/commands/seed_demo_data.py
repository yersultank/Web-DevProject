from itertools import cycle

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from assets.models import Asset, Assignment, Category, UserProfile


class Command(BaseCommand):
    help = 'Seed simple demo users/assets for local demonstrations.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=3,
            help='Number of non-admin users to create (default: 3).',
        )
        parser.add_argument(
            '--assets',
            type=int,
            default=24,
            help='Number of assets to create (default: 24).',
        )
        parser.add_argument(
            '--admin-username',
            type=str,
            default='admin',
            help='Admin username (default: admin).',
        )
        parser.add_argument(
            '--user-prefix',
            type=str,
            default='user',
            help='Prefix for generated users: user1, user2... (default: user).',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='pass1234',
            help='Password used for generated users/admin (default: pass1234).',
        )
        parser.add_argument(
            '--no-reset',
            action='store_true',
            help='Do not reset previously seeded users/assets.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        user_count = options['users']
        asset_count = options['assets']
        admin_username = options['admin_username']
        user_prefix = options['user_prefix']
        password = options['password']
        reset = not options['no_reset']

        if user_count < 1:
            raise CommandError('--users must be at least 1.')
        if asset_count < 1:
            raise CommandError('--assets must be at least 1.')
        if not admin_username.strip():
            raise CommandError('--admin-username cannot be empty.')
        if not user_prefix.strip():
            raise CommandError('--user-prefix cannot be empty.')

        if reset:
            self._reset_seeded_data(user_prefix=user_prefix)

        categories = self._seed_categories()
        admin_user = self._seed_admin(admin_username, password)
        normal_users = self._seed_users(user_count, user_prefix, password)
        stats = self._seed_assets(asset_count, categories, normal_users)

        self.stdout.write(self.style.SUCCESS('Seed data ready.'))
        self.stdout.write(f"Admin: {admin_username} / {password}")
        self.stdout.write(f"Users: {user_prefix}1..{user_prefix}{user_count} / {password}")
        self.stdout.write(
            (
                'Assets summary: '
                f"created={stats['created_assets']}, "
                f"updated={stats['updated_assets']}, "
                f"assigned={stats['active_assignments']}"
            )
        )
        self.stdout.write(f"Categories available: {', '.join(c.name for c in categories)}")
        self.stdout.write(f'Admin profile id: {admin_user.profile.id}')

    def _reset_seeded_data(self, user_prefix):
        user_model = get_user_model()
        prefixed_users = user_model.objects.filter(username__startswith=f'{user_prefix}')
        legacy_users = user_model.objects.filter(username__startswith='demo_')
        seed_users = prefixed_users | legacy_users

        # Keep an existing manually created admin account untouched.
        seed_users = seed_users.exclude(username='admin')
        deleted_users = seed_users.count()
        seed_users.delete()

        deleted_assets, _ = Asset.objects.filter(
            Q(serial_number__startswith='DEMO-') | Q(serial_number__startswith='ASSET-')
        ).delete()
        self.stdout.write(
            f'Reset previous seed data: users={deleted_users}, assets={deleted_assets}.'
        )

    def _seed_categories(self):
        category_names = ['Laptop', 'Desktop', 'Monitor', 'Network', 'Peripheral', 'Mobile']
        categories = []
        for name in category_names:
            category, _ = Category.objects.get_or_create(name=name)
            categories.append(category)
        return categories

    def _seed_admin(self, admin_username, password):
        user_model = get_user_model()
        admin, created = user_model.objects.get_or_create(
            username=admin_username,
            defaults={
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        if created:
            self.stdout.write(f'Created {admin_username} user.')
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.set_password(password)
        admin.save()

        profile, _ = UserProfile.objects.get_or_create(user=admin)
        profile.department = 'IT Operations'
        profile.position = 'Asset Administrator'
        profile.phone = '+7 700 000 00 01'
        profile.office_address = 'HQ - Room A101'
        profile.save()
        return admin

    def _seed_users(self, user_count, user_prefix, password):
        user_model = get_user_model()
        departments = ['Engineering', 'Finance', 'HR', 'Support', 'Security']
        positions = ['Engineer', 'Analyst', 'Coordinator', 'Specialist', 'Operator']

        users = []
        for i in range(1, user_count + 1):
            username = f'{user_prefix}{i}'
            user, created = user_model.objects.get_or_create(
                username=username,
                defaults={'is_staff': False, 'is_active': True},
            )
            if created:
                self.stdout.write(f'Created {username}.')
            user.is_staff = False
            user.is_active = True
            user.set_password(password)
            user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.department = departments[(i - 1) % len(departments)]
            profile.position = positions[(i - 1) % len(positions)]
            profile.phone = f'+7 700 000 {i:02d} {i:02d}'
            profile.office_address = f'HQ - Room B{i:03d}'
            profile.save()

            users.append(user)
        return users

    def _seed_assets(self, asset_count, categories, demo_users):
        categories_cycle = cycle(categories)
        created_assets = 0
        updated_assets = 0
        active_assignments = 0
        assigned_cursor = 0

        for i in range(1, asset_count + 1):
            serial_number = f'ASSET-{i:05d}'
            category = next(categories_cycle)
            should_assign = i % 4 == 0

            if should_assign:
                status = Asset.Status.ASSIGNED
                assignee = demo_users[assigned_cursor % len(demo_users)]
                assigned_cursor += 1
            else:
                assignee = None
                if i % 3 == 0:
                    status = Asset.Status.MAINTENANCE
                elif i % 5 == 0:
                    status = Asset.Status.RETIRED
                else:
                    status = Asset.Status.AVAILABLE

            defaults = {
                'name': f'{category.name} Asset {i}',
                'description': f'Seeded asset #{i} for dashboard and filter testing.',
                'status': status,
                'category': category,
            }
            asset, created = Asset.objects.get_or_create(serial_number=serial_number, defaults=defaults)

            if created:
                created_assets += 1
            else:
                updated_assets += 1
                asset.name = defaults['name']
                asset.description = defaults['description']
                asset.status = status
                asset.category = category
                asset.save(update_fields=['name', 'description', 'status', 'category', 'updated_at'])

            active_assignment = asset.assignments.filter(returned_at__isnull=True).first()

            if assignee is None:
                if active_assignment:
                    active_assignment.returned_at = timezone.now()
                    active_assignment.save(update_fields=['returned_at'])
                if asset.status != status:
                    asset.status = status
                    asset.save(update_fields=['status', 'updated_at'])
                continue

            if active_assignment and active_assignment.user_id == assignee.id:
                active_assignments += 1
                if asset.status != Asset.Status.ASSIGNED:
                    asset.status = Asset.Status.ASSIGNED
                    asset.save(update_fields=['status', 'updated_at'])
                continue

            if active_assignment and active_assignment.user_id != assignee.id:
                active_assignment.returned_at = timezone.now()
                active_assignment.save(update_fields=['returned_at'])

            Assignment.objects.create(
                asset=asset,
                user=assignee,
                notes='Auto-assigned by seed_demo_data command.',
            )
            active_assignments += 1

            if asset.status != Asset.Status.ASSIGNED:
                asset.status = Asset.Status.ASSIGNED
                asset.save(update_fields=['status', 'updated_at'])

        return {
            'created_assets': created_assets,
            'updated_assets': updated_assets,
            'active_assignments': active_assignments,
        }
