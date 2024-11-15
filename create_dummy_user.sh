API_ENDPOINT="http://tikoko-dev.site/api/user/create"

curl -XPOST -H "Content-type: application/json" -d '{"username":"TEST","password":"none"}' "$API_ENDPOINT"
curl -XPOST -H "Content-type: application/json" -d '{"username":"TEST_2","password":"none"}' "$API_ENDPOINT"
