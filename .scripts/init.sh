#!/bin/sh

set -e

HOOKS_DIR=$(git rev-parse --show-toplevel)/.git/hooks
SCRIPTS_DIR=$(realpath $(dirname ${BASH_SOURCE[0]}))

if [ ! -h $HOOKS_DIR/pre-commit ]; then
  echo "[SCRIPTS] Adding Git pre-commit hook"
  ln -s $SCRIPTS_DIR/hooks/pre-commit.sh $HOOKS_DIR/pre-commit
fi
