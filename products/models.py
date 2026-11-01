from mongoengine import (
    Document, StringField, URLField, DateTimeField,
    FloatField, IntField
)
from datetime import datetime


class SaturnProduct(Document):
    """Saturn.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)
    produktbeschreibung = StringField(null=True, blank=True, db_field='Produktbeschreibung')
    produktdaten = StringField(null=True, blank=True, db_field='Produktdaten')

    meta = {
        'collection': 'Db',
        # Scrapers own these collections and their indexes; creating ours on
        # first access fails when a scraper recreated sku_1 without unique=True.
        'auto_create_index': False,
        'db_alias': 'default',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title


class MediaMarktProduct(Document):
    """MediaMarkt.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)
    produktbeschreibung = StringField(null=True, blank=True, db_field='Produktbeschreibung')
    produktdaten = StringField(null=True, blank=True, db_field='Produktdaten')

    meta = {
        'collection': 'Db',
        # Scrapers own these collections and their indexes; creating ours on
        # first access fails when a scraper recreated sku_1 without unique=True.
        'auto_create_index': False,
        'db_alias': 'mediamarkt',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title


class OttoProduct(Document):
    """Otto.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)
    produktbeschreibung = StringField(null=True, blank=True, db_field='Produktbeschreibung')
    produktdaten = StringField(null=True, blank=True, db_field='Produktdaten')

    meta = {
        'collection': 'Db',
        # Scrapers own these collections and their indexes; creating ours on
        # first access fails when a scraper recreated sku_1 without unique=True.
        'auto_create_index': False,
        'db_alias': 'otto',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title


class KauflandProduct(Document):
    """Kaufland.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)
    produktbeschreibung = StringField(null=True, blank=True, db_field='Produktbeschreibung')
    produktdaten = StringField(null=True, blank=True, db_field='Produktdaten')

    meta = {
        'collection': 'Db',
        # Scrapers own these collections and their indexes; creating ours on
        # first access fails when a scraper recreated sku_1 without unique=True.
        'auto_create_index': False,
        'db_alias': 'kaufland',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title