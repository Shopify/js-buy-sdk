#!/bin/bash

# Encoding token from username and pw
ENCODED_TOKEN=$(echo -n "$NEXUS_RM_USERNAME":"$NEXUS_RM_PASSWORD" | openssl base64)

# Setting .npmrc
cat > ~/.npmrc <<EOL
//https://nexus.qa.whoop.com/repository/:_authToken=
always_auth=true
registry=https://nexus.qa.whoop.com/repository/npm-group/
user=$NEXUS_RM_USERNAME
_auth=$ENCODED_TOKEN
EOL
