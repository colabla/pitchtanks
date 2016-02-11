// deploys the service

// remove the image
docker rm -f pitchtanks/web

// create the new image
docker build \
  -f Dockerfile \
  -t pitchtanks/web .

// build image if it doesn't exist,updates if it does
docker-compose -f docker-compose-production.yml build

// deploys service
docker-compose -f docker-compose-production.yml up -d
