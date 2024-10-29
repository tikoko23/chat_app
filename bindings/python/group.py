from .user import User

class Group:
    def __init__(self, id: int, name: str, owner: User):
        self.id = id
        self.name = name
        self.owner = owner