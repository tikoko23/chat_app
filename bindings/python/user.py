class User:
    def __init__(self, id: int, name: str, createdAt: str, /, *, displayName: str | None = None):
        self.id = int(id)
        self.name = str(name)
        self.createdAt = str(createdAt)
        self.displayName = str(displayName) if not (displayName is None) else None