#!/bin/bash
set -e

# Export macOS system certs for Python SSL (Homebrew Python doesn't bundle them)
security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > /tmp/system_certs.pem 2>/dev/null
security find-certificate -a -p /Library/Keychains/System.keychain >> /tmp/system_certs.pem 2>/dev/null

export SSL_CERT_FILE=/tmp/system_certs.pem
export REQUESTS_CA_BUNDLE=/tmp/system_certs.pem

source "$(dirname "$0")/.venv/bin/activate"
uvicorn main:app --port 8000 --reload
