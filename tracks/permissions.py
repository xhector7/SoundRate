from rest_framework.permissions import BasePermission, SAFE_METHODS
import rest_framework.permissions as permissions

#  PERMISO PERSONALIZADO: SOLO EL OWNER PUEDE EDITAR, PERO TODOS PUEDEN LEER, 
# despues se usara esta clase en views para poder definir la seguridad

class IsOwnerOrReadOnly(BasePermission):
    """
    Permite:
    - Lectura a cualquiera
    - Escritura solo al owner del objeto
    """

    def has_object_permission(self, request, view, obj):
        # 🔓 Lectura siempre permitida (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 🔐 Escritura solo si eres el dueño
        return obj.owner == request.user