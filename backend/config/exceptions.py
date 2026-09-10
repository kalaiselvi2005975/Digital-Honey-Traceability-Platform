from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        if isinstance(response.data, dict) and 'detail' in response.data and len(response.data) == 1:
            response.data = {'error': str(response.data['detail'])}
        return response
    return Response(
        {'error': 'An unexpected server error occurred.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
