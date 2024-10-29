from python.client import Client
from python.user import User

# The token that was previously here was a troll
client = Client(User.get_access_token("no free", "account for you"))

print(client.user.name)
print(client.user.displayName)
print(client.user.createdAt)
print(client.user.email)

for group in client.fetch_joined_groups():
    print(group.name)