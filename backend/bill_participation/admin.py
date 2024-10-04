from django.contrib import admin
from .models import Issue, Opinion

# Register your models here.

class BillAdmin(admin.ModelAdmin):
    pass
admin.site.register(Issue, BillAdmin)

class OpinionAdmin(admin.ModelAdmin):
    pass
admin.site.register(Opinion, OpinionAdmin)