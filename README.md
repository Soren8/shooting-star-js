# Shooting Star

Small game where you keep the shooting star from hitting the ground

Port of https://github.com/Soren8/shooting-star

## Deployment

```
docker build -t shooting-star .

docker save -o shooting-star.tar shooting-star
scp shooting-star.tar ${HOST}:~
ssh ${HOST}

docker load -i ~/shooting-star.tar
docker run -d -p 80:80 shooting-star
```
