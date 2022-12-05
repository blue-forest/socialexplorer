#!/bin/sh

set -e

GIT_HOOKS=$(git rev-parse --show-toplevel)/.git/hooks

DIR=$(realpath $(dirname ${BASH_SOURCE[0]}))

if [ ! -f $GIT_HOOKS/pre-commit ]; then
  echo "[SCRIPTS] Adding Git pre-commit hook"
  ln -s $DIR/hooks/pre-commit.sh $GIT_HOOKS/pre-commit
fi
