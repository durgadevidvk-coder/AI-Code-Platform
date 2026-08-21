from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Project, CodeFile, AIRequest
from .serializers import (
    ProjectSerializer,
    CodeFileSerializer,
    AIRequestSerializer,
)

from .gemini_service import generate_code


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CodeFileViewSet(viewsets.ModelViewSet):
    serializer_class = CodeFileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CodeFile.objects.filter(
            project__user=self.request.user
        )


class AIRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AIRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ai_request = serializer.save(user=self.request.user)

        try:
            generated_code = generate_code(ai_request.prompt)

            ai_request.response = generated_code
            ai_request.save()

        except Exception as e:
            ai_request.response = f"AI generation failed: {str(e)}"
            ai_request.save()