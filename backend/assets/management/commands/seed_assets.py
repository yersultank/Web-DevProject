from itertools import cycle
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from assets.models import Asset, Assignment, Category


IMAGE_URLS = {
    'Laptop': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    'Monitor': 'https://images.unsplash.com/photo-1527443224154-c4a573d5b5e5?w=400&q=80',
    'Phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'Chair': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&q=80',
    'Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    'Network': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
}


ASSET_SEED_DATA = [
    ('Dell XPS 15', 'Laptop', '15-inch performance laptop for engineering workloads.'),
    ('MacBook Pro 14', 'Laptop', 'Apple Silicon laptop for design and development tasks.'),
    ('Lenovo ThinkPad X1 Carbon', 'Laptop', 'Lightweight business laptop for mobile teams.'),
    ('LG UltraWide 34', 'Monitor', '34-inch ultrawide monitor for analytics and multitasking.'),
    ('Dell UltraSharp U2723QE', 'Monitor', '4K monitor used by product and design teams.'),
    ('Samsung Smart Monitor M8', 'Monitor', 'Flexible office monitor with integrated smart features.'),
    ('iPhone 14 Pro', 'Phone', 'Corporate phone for management and field communication.'),
    ('Samsung Galaxy S23', 'Phone', 'Android smartphone for support and operations staff.'),
    ('Google Pixel 8', 'Phone', 'Test device for mobile QA and app verification.'),
    ('Herman Miller Aeron', 'Chair', 'Ergonomic office chair for workstation comfort.'),
    ('Steelcase Gesture', 'Chair', 'Adjustable chair for long daily desk sessions.'),
    ('IKEA Markus', 'Chair', 'Reliable office chair for shared desks and labs.'),
    ('Keychron K8', 'Keyboard', 'Mechanical wireless keyboard for engineering teams.'),
    ('Logitech MX Keys', 'Keyboard', 'Low-profile keyboard for productivity workflows.'),
    ('Razer BlackWidow V4', 'Keyboard', 'Tactile keyboard for power users and creators.'),
    ('Cisco Meraki MX68', 'Network', 'Branch security appliance for small office networks.'),
    ('Ubiquiti UniFi Dream Machine', 'Network', 'Unified gateway for network monitoring and routing.'),
    ('TP-Link TL-SG3428', 'Network', 'Managed switch for office floor connectivity.'),
    ('HP EliteBook 840 G10', 'Laptop', 'Standard laptop image for newly onboarded staff.'),
    ('AOC Q27G3XMN', 'Monitor', 'QHD monitor for content review and general operations.'),
]


class Command(BaseCommand):
    help = 'Seed 20 realistic assets for AssetOS demo usage.'

    @transaction.atomic
    def handle(self, *args, **options):
        if Asset.objects.exists():
            self.stdout.write('Already seeded')
            return

        categories = self._create_categories()
        status_cycle = cycle([
            Asset.Status.AVAILABLE,
            Asset.Status.ASSIGNED,
            Asset.Status.MAINTENANCE,
        ])

        user_model = get_user_model()
        assignee = user_model.objects.filter(is_superuser=True).order_by('id').first()

        for index, (name, category_name, description) in enumerate(ASSET_SEED_DATA, start=1):
            serial_number = f'ASSET-{index:05d}'
            status = next(status_cycle)
            category = categories[category_name]
            image_url = IMAGE_URLS[category_name]

            asset = Asset(
                name=name,
                serial_number=serial_number,
                description=description,
                status=status,
                category=category,
            )

            image_file = self._download_image(image_url, serial_number)
            if image_file is not None:
                asset.image.save(f'{serial_number.lower()}.jpg', image_file, save=False)

            asset.save()

            if status == Asset.Status.ASSIGNED and assignee is not None:
                Assignment.objects.create(
                    asset=asset,
                    user=assignee,
                    notes='Assigned by seed_assets command.',
                )

        if assignee is None:
            self.stdout.write(self.style.WARNING('No superuser found; assigned assets were not linked.'))

        self.stdout.write('Seeded 20 assets successfully')

    def _create_categories(self):
        categories = {}
        for name in IMAGE_URLS.keys():
            category, _ = Category.objects.get_or_create(name=name)
            categories[name] = category
        return categories

    def _download_image(self, image_url, serial_number):
        request = Request(image_url, headers={'User-Agent': 'AssetOS Seeder'})
        try:
            with urlopen(request, timeout=15) as response:
                image_bytes = response.read()
            return ContentFile(image_bytes, name=f'{serial_number.lower()}.jpg')
        except (HTTPError, URLError, TimeoutError, ValueError):
            return None
