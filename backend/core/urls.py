from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, CodeFileViewSet, AIRequestViewSet


router = DefaultRouter()

router.register("projects", ProjectViewSet, basename="projects")
router.register("files", CodeFileViewSet, basename="files")
router.register("ai-requests", AIRequestViewSet, basename="ai-requests")


urlpatterns = router.urls