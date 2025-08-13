#!/bin/bash

set -e

npm run build

cp -r ./morfer ./dist/

INDEX_FILE="dist/index.html"

SCRIPTS=$(grep -oP '<script.*?</script>' "$INDEX_FILE" | tr -d '\n')


sed -i -E 's|<script.*</script>||g' "$INDEX_FILE"

# Вставляем перед </body>
sed -i "s|</body>|${SCRIPTS}</body>|" "$INDEX_FILE"

