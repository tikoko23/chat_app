class EndpointResponseException(Exception):
    def __init__(self, *args):
        super().__init__(*args)

class MissingKeyException(Exception):
    def __init__(self, *args):
        super().__init__(*args)