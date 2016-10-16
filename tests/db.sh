curl 'http://localhost:3000/apis/db/create_user?openid=1&info=a'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=2&info=b'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=3&info=c'
echo ' '
curl 'http://localhost:3000/apis/db/create_user?openid=4&info=d'
echo ' '

#curl http://localhost:3000/apis/db/update_user?id=29b1cda2-09a5-46dd-88ad-e3e6ea280fe2&info=f
curl http://localhost:3000/apis/db/list_user
echo ' '

curl 'http://localhost:3000/apis/db/create_lock?thing=\{"openid":"4","info":"d"\}'

