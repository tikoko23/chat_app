from enum import Enum

API_URL = "https://tikoko-dev.site/api"

class Endpoints(Enum):
    def __init__(self):
        super().__init__()

    # User enums

    U_CREATE           = f"{API_URL}/user/create"
    U_DELETE           = f"{API_URL}/user/delete"
    U_FETCH_SELF       = f"{API_URL}/user/fetch-self"
    U_GET_ACCESS_TOKEN = f"{API_URL}/user/get-access-token"

    # Group enums

    G_CREATE = f"{API_URL}/group/create"
    G_FETCH_JOINED = f"{API_URL}/group/fetch-joined"
    G_FETCH = f"{API_URL}/group/fetch"
    G_JOIN = f"{API_URL}/group/join"

    # Message enums

    M_CREATE = f"{API_URL}/message/create"
    M_FETCH = f"{API_URL}/message/fetch"
