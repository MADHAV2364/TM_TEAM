from django import forms
from . import models

class CreatePost(forms.ModelForm):
    class Meta:
        model = models.Post
        fields = ['title', 'name', 'email', 'phone', 'address', 'city', 'zip_code', 'items', 'slug', 'banner']