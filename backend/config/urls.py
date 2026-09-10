from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from batches.views import PublicBatchView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/hives/', include('hives.urls')),
    path('api/harvests/', include('harvests.urls')),
    path('api/batches/', include('batches.urls')),
    path('api/public/batches/<str:batch_id>/', PublicBatchView.as_view(), name='public-batch'),
    path('api/ai/', include('ai_services.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
