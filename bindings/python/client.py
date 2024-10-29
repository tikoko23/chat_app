import requests

from endpoints import Endpoints

class Client:
    def __init__(self, token: str, /):
        self.token = str(token)