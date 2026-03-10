from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that formats all errors consistently
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': str(exc),
            'detail': response.data
        }
        response.data = custom_response_data
    else:
        # Handle non-DRF exceptions
        custom_response_data = {
            'success': False,
            'error': 'Erro interno do servidor',
            'detail': str(exc)
        }
        response = Response(
            custom_response_data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
