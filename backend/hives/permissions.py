from rest_framework import permissions


class IsBeekeeperOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_beekeeper or request.user.is_admin_user


class IsHiveOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        return obj.beekeeper_id == request.user.id
