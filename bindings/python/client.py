import requests

from endpoints import Endpoints
from exceptions import EndpointResponseException

class Client:
    def __init__(self, token: str, /):
        self.token = str(token)
        self.update_user()

    def update_user(self) -> None:
        response = self.request("GET", Endpoints.U_FETCH_SELF)
        json = response.json()

        

    def request(self, method: str | bytes, endpoint: str | bytes, request_args: dict = {}, /, *, excludeAuthToken: bool = False) -> requests.Response:
        if not excludeAuthToken:
            headers = request_args.get("headers")

            if headers is None:
                request_args["headers"] = {}
                headers = request_args["headers"]

            headers["Authorization"] = self.token

        response: requests.Response = requests.request(method, endpoint, **request_args)

        if response.status_code < 200 or response.status_code > 299:
            raise EndpointResponseException(f"Request failed with code {response.status_code}. Response content: {response.text}")

        return response