from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.search import index


CATEGORY_CHOICES = [
    ('Kaufberatung', 'Kaufberatung'),
    ('Spartipps', 'Spartipps'),
    ('Technik', 'Technik'),
    ('Nachrichten', 'Nachrichten'),
    ('Testberichte', 'Testberichte'),
]


class BlogIndexPage(Page):
    """Parent page that lists all blog articles."""
    intro = RichTextField(blank=True, help_text='Einleitungstext für die Blog-Übersicht')

    content_panels = Page.content_panels + [
        FieldPanel('intro'),
    ]

    subpage_types = ['blog.BlogPage']
    parent_page_types = ['wagtailcore.Page']

    class Meta:
        verbose_name = 'Blog Übersicht'


class BlogPage(Page):
    """A single blog article."""
    excerpt = models.CharField(max_length=500, help_text='Kurzbeschreibung für die Artikelliste')
    content = models.TextField(help_text='Artikel-Inhalt (HTML)')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Kaufberatung')
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text='Titelbild (wird auf Cloudinary gespeichert)',
    )
    amazon_keywords = models.CharField(max_length=500, blank=True, help_text='Kommagetrennte Amazon-Keywords')
    amazon_product_url = models.URLField(max_length=500, blank=True, help_text='Amazon-Produkt-URL (falls vorhanden)')
    product_names = models.CharField(max_length=500, blank=True, help_text='Produktnamen für Produktkarten (kommagetrennt, z.B. Sony WH-1000XM5, Bose QuietComfort 45)')
    author = models.CharField(max_length=100, default='Preisradio Redaktion')
    read_time = models.IntegerField(default=5, help_text='Lesezeit in Minuten')
    published_date = models.DateField(auto_now_add=True)

    content_panels = Page.content_panels + [
        FieldPanel('excerpt'),
        FieldPanel('category'),
        FieldPanel('image'),
        FieldPanel('content'),
        FieldPanel('amazon_keywords'),
        FieldPanel('amazon_product_url'),
        FieldPanel('product_names'),
        FieldPanel('author'),
        FieldPanel('read_time'),
    ]

    search_fields = Page.search_fields + [
        index.SearchField('excerpt'),
        index.SearchField('content'),
        index.FilterField('category'),
    ]

    parent_page_types = ['blog.BlogIndexPage']
    subpage_types = []

    class Meta:
        verbose_name = 'Blog Artikel'
        verbose_name_plural = 'Blog Artikel'
