from .exceptions import MissingKeyException
from .user import User

class Group:
    def __init__(self, id: int, name: str, owner: User, /):
        self.id = id
        self.name = name
        self.owner = owner

    @staticmethod
    def from_dict(object: dict):
        id = object.get("id")

        if id is None:
            raise MissingKeyException("Key 'id' is missing from dictionary argument")

        name = object.get("name")

        if name is None:
            raise MissingKeyException("Key 'name' is missing from dictionary argument")

        owner = object.get("owner")

        if not (owner is None):
            owner = User.from_dict(owner)

        return Group(id, name, owner)