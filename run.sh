#!/bin/bash

docker build -t tests . && docker run tests