from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnlyAuthenticated(BasePermission):
    """
    Permite leitura para qualquer usuario autenticado e escrita apenas para admin/superuser.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return bool(getattr(user, 'is_superuser', False) or getattr(user, 'is_admin', False))


class IsAdminOrProfessorWriteReadOnlyAuthenticated(BasePermission):
    """
    Permite leitura para qualquer usuario autenticado e escrita para admin/superuser/professor.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return bool(
            getattr(user, 'is_superuser', False)
            or getattr(user, 'is_admin', False)
            or getattr(user, 'is_professor', False)
        )
