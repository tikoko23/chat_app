#!/usr/bin/env python3
import requests

help_str = \
"""
Options (defaults to h):
- h: Shows this help message
- u: Uploads a file
- d: Downloads a file
- c: Creates an account
- l: Logins to an account
- o: Logs out of the active account
- e: Exits the script
"""

protocol = "http"
base_url = "tikoko-dev.site"
cdn_subdir = "cdn"
api_subdir = "api"

site_url = f"{protocol}://{base_url}"
cdn_url = f"{site_url}/{cdn_subdir}"
api_subdir = f"{site_url}/{api_subdir}"

def log_response(response: requests.Response, fieldToPrint: str | None = None) -> None:
    if fieldToPrint is None:
        print(f"Status {response.status_code}: {response.content.decode()}")
    else:
        print(f"Status {response.status_code}: {response.json().get(fieldToPrint)}")

def create_user(username, password, displayName = None, email = None) -> None:
    response = requests.post(
        f"{api_subdir}/user/create",
        json={
            "username": username,
            "displayName": displayName,
            "password": password,
            "email": email
        }
    )

    log_response(response)

def get_token(username: str, password: str) -> str | None:
    response = requests.post(
        f"{api_subdir}/user/get-access-token",
        json={
            "username": username,
            "password": password
        }
    )

    token = None
    try:
        token = response.json().get("token")
    except requests.exceptions.JSONDecodeError:
        pass

    if not (token is None):
        log_response(response, "status")
    else:
        print("TOKEN is None")
    
    return token

# Returns the pathname to access the file with
# Name is an optional string, replaces the filename after upload
def upload_file(path: str, token: str, name = None) -> str:
    with open(path, "rb") as file:
        file_data = file.read()
    
    target_url = f"{api_subdir}/upload"

    if not (name is None):
        target_url += f"?filename={name}"

    response = requests.post(
        target_url,
        headers={
            "Authorization": token
        },
        data=file_data
    )

    log_response(response, "status")

    return response.json()["path"]
        
def download_file(cdn_path: str, mime_type: str | None) -> bytes:
    target_url = f"{cdn_url}/{cdn_path}"

    if not (mime_type is None):
        target_url += f"?mime={mime_type}"

    response = requests.get(target_url)

    return response.content

TOKEN = None

while True:
    action = input("Action (H/u/d/c/l/o/e): ").lower()

    match action:
        case "u":
            if TOKEN is None:
                print("TOKEN is None\nPlease create an account or login to an existing one first")
            else:
                filepath = input("Filepath: ")
                name = input("Custom file name (optional): ")

                if name == "":
                    name = None
                
                try:
                    cdn_path = upload_file(filepath, TOKEN, name)
                    print(f"File upladed to {cdn_url}/{cdn_path}")
                except FileNotFoundError:
                    print("File not found in specified path")
        case "d":
            path = input("Filepath: ")
            write_to = input("Write contents to (leave empty to write to stdout): ")
            mime = input("Custom mime type (optional, useful for browsers): ")

            if write_to == "":
                write_to = None

            if mime == "":
                mime = None

            file_data = download_file(path, mime)

            if write_to is None:
                print(file_data.decode)
            else:
                with open(write_to, "wb") as file:
                    file.write(file_data)

        case "c":
            username = input("Username: ")
            displayName = input("Display name (optional): ")

            if displayName == "":
                displayName = None

            password = input("Password: ")
            email = input("Email (optional): ")

            if email == "":
                email = None
            
            create_user(username, password, displayName, email)

            TOKEN = get_token(username, password)

            if not (TOKEN is None):
                print(f"Logged in as {username}") 

        case "l":
            username = input("Username: ")
            password = input("Password: ")

            TOKEN = get_token(username, password)

            if not (TOKEN is None):
                print(f"Logged in as {username}") 

        case "o":
            TOKEN = None
            print("Logged out")

        case "e":
            print("Exiting...")
            break

        case _:
            print(help_str)