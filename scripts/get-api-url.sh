#!/bin/bash

API_ID=$(pulumi stack output apiId)
ECHO "http://localhost:4566/restapis/$API_ID/local/_user_request_/"
