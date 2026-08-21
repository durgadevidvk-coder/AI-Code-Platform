

# Register your models here.
from django.contrib import admin
from .models import User, Project, CodeFile, AIRequest


admin.site.register(User)
admin.site.register(Project)
admin.site.register(CodeFile)
admin.site.register(AIRequest)