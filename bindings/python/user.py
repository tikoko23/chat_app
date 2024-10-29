from .exceptions import MissingKeyException

class User:
    def __init__(self, id: int, name: str, createdAt: str, /, *, displayName: str | None = None):
        self.id = id
        self.name = name
        self.createdAt = createdAt
        self.displayName = displayName

    @staticmethod
    def fromDict(object: dict):
        id = object.get("id")

        if id is None:
            raise MissingKeyException("Key 'id' is missing from dictionary argument")

        name = object.get("name")

        if name is None:
            raise MissingKeyException("Key 'name' is missing from dictionary argument")

        createdAt = object.get("createdAt")

        if createdAt is None:
            raise MissingKeyException("Key 'createdAt' is missing from dictionary argument")

        displayName = object.get("displayName")

        return User(id, name, createdAt, displayName=displayName)