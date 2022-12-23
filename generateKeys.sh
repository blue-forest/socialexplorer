#!/bin/sh

openssl genrsa -out key.pem 1024

openssl rsa -in key.pem -pubout > key.pub
