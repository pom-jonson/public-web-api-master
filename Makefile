setup-local:
	pulumi logout
	pulumi login --local
	pulumi stack select local

start-local: setup-local
	docker-compose up -d

deploy-local: start-local
	pulumi up -s local -y

destroy-local: setup-local
	pulumi destroy -stack local -yes
	pulumi stack rm -f -y -s

stop-local:
	docker-compose down;

print-local-api-url:
	./scripts/get-api-url.sh
