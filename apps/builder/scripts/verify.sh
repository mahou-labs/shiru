#!/usr/bin/env bash
# Builds the builder image and runs every fixture through build-site the way
# the sandbox does: no network, an environment of only PATH and SITE_URL, and
# one warm container reused across builds.
set -uo pipefail

cd "$(dirname "$0")/.."
image=shiru-builder:dev
container=shiru-builder-verify
site_url=https://acme.shiru.sh
tmp=$(mktemp -d)
passed=0
failed=0

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1
  rm -rf "$tmp"
}
trap cleanup EXIT

check() {
  local name=$1
  shift
  if "$@"; then
    echo "PASS $name"
    passed=$((passed + 1))
  else
    echo "FAIL $name"
    failed=$((failed + 1))
  fi
}

equals() {
  [[ "$1" == "$2" ]] && return 0
  printf '  expected: %s\n  actual:   %s\n' "$2" "$1"
  return 1
}

build() {
  docker exec "$container" env -i PATH=/usr/local/bin:/usr/bin:/bin SITE_URL="$site_url" \
    build-site "$1" "$2" >"$tmp/stdout" 2>"$tmp/stderr"
  code=$?
  stdout=$(cat "$tmp/stdout")
  stderr=$(cat "$tmp/stderr")
}

file_exists() { docker exec "$container" test -f "$1"; }
file_missing() { ! docker exec "$container" test -e "$1"; }
file_contains() { docker exec "$container" grep -qF -- "$2" "$1"; }
file_lacks() { ! docker exec "$container" grep -qF -- "$2" "$1"; }
seconds_since() { awk -v s="$1" -v e="$(date +%s%N)" 'BEGIN { printf "%.1f", (e - s) / 1e9 }'; }

node scripts/generate-schema.ts
check "docs.config.schema.json matches src/config.ts" git diff --quiet -- docs.config.schema.json

docker build --platform linux/amd64 -t "$image" . >"$tmp/docker-build.log" 2>&1 ||
  {
    cat "$tmp/docker-build.log"
    exit 1
  }
docker run -d --rm --network none --name "$container" "$image" sleep infinity >/dev/null
docker exec "$container" mkdir -p /work
for fixture in fixtures/*/; do docker cp "$fixture" "$container:/work/" >/dev/null; done
template_version=$(node -p 'require("./template/package.json").version')

start=$(date +%s%N)
build /work/good /out/good
cold=$(seconds_since "$start")
check "good: exits 0" equals "$code" 0
check "good: stdout is only the result line" equals "$stdout" "{\"ok\":true,\"templateVersion\":\"$template_version\"}"
check "good: home page HTML" file_exists /out/good/index.html
check "good: nested page HTML" file_exists /out/good/guides/setup/index.html
check "good: page outside navigation still builds" file_exists /out/good/guides/faq/index.html
check "good: Markdown variant of a page" file_exists /out/good/guides/setup/index.md
check "good: llms.txt" file_exists /out/good/llms.txt
check "good: asset copied" file_exists /out/good/assets/logo.svg
check "good: canonical link uses SITE_URL" \
  file_contains /out/good/guides/setup/index.html '<link rel="canonical" href="https://acme.shiru.sh/guides/setup/">'
check "good: HTML links to its Markdown variant" \
  file_contains /out/good/guides/setup/index.html '<link rel="alternate" type="text/markdown" href="https://acme.shiru.sh/guides/setup/index.md">'
check "good: llms.txt lists the home page under SITE_URL" \
  file_contains /out/good/llms.txt '- [Acme Docs](https://acme.shiru.sh/index.md)'
check "good: page source reaches Nimbus as written" \
  file_contains /out/good/guides/faq/index.md '[setup](/guides/setup/#install)'
check "good: component renders" file_contains /out/good/guides/setup/index.html 'Acme needs Node 24 or later.'
check "good: logo in the header" file_contains /out/good/index.html '<img src="/assets/logo.svg" alt="" class="h-6 w-auto">'
check "good: navigation label in the sidebar" file_contains /out/good/index.html '>Introduction<'
check "good: name from docs.config.json in the title" file_contains /out/good/guides/setup/index.html '<title>Setup | Acme Docs</title>'
check "good: github link in the header" file_contains /out/good/index.html 'href="https://github.com/acme/acme"'
check "good: _headers lets the edge cache keep pages until the next deploy" \
  file_contains /out/good/_headers 'Cache-Control: public, max-age=0, must-revalidate, s-maxage=31536000'
check "good: _headers marks hashed /_astro/ files immutable" \
  equals "$(docker exec "$container" grep -A2 -xF '/_astro/*' /out/good/_headers)" \
  $'/_astro/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable'
check "good: _headers keeps the Nimbus agent discovery rules" \
  file_contains /out/good/_headers '# Nimbus agent discovery (generated)'

docker exec "$container" rm -f /work/good/content/guides/faq.mdx
start=$(date +%s%N)
build /work/good /out/good
warm=$(seconds_since "$start")
check "rebuild: exits 0" equals "$code" 0
check "rebuild: deleted page HTML is gone" file_missing /out/good/guides/faq/index.html
check "rebuild: deleted page Markdown is gone" file_missing /out/good/guides/faq/index.md
check "rebuild: deleted page is gone from llms-full.txt" file_lacks /out/good/llms-full.txt 'Does Acme run offline?'
check "rebuild: remaining page still built" file_exists /out/good/guides/setup/index.html

build /work/bad-config /out/bad-config
check "bad-config: exits 1" equals "$code" 1
check "bad-config: stderr names each field path" equals "$stderr" "docs.config.json: github must be an https://github.com/ URL
docs.config.json: navigation[2].href is not a valid path"
check "bad-config: result line lists the errors" equals "$(tail -n1 <<<"$stdout")" \
  '{"ok":false,"errors":["docs.config.json: github must be an https://github.com/ URL","docs.config.json: navigation[2].href is not a valid path"]}'
check "bad-config: writes no output" file_missing /out/bad-config

build /work/mdx-features /out/mdx-features
check "mdx-features: exits 0" equals "$code" 0
check "mdx-features: exported const renders through an expression" \
  file_contains /out/mdx-features/index.html 'The answer is 42.'
check "mdx-features: imported .mdx partial renders" \
  file_contains /out/mdx-features/index.html 'Imported note text from _note.mdx.'
check "mdx-features: imported .astro component renders with an expression prop" \
  file_contains /out/mdx-features/index.html '<strong>Computed 42</strong> Callout body from a local component.'
check "mdx-features: imported .js module value renders" \
  file_contains /out/mdx-features/index.html 'Latest release: 2.4.1.'
check "mdx-features: expression attribute on a built-in component" \
  file_contains /out/mdx-features/index.html 'aria-label="Title from an expression"'
check "mdx-features: imported .tsx React component renders statically" \
  file_contains /out/mdx-features/index.html '<p class="greeting">Hello <!-- -->Acme<!-- --> from a React component.</p>'
check "mdx-features: client:load .jsx component is server-rendered with its props" \
  file_contains /out/mdx-features/index.html 'Clicked <!-- -->3<!-- --> times'
check "mdx-features: client:load .jsx component is an island" \
  file_contains /out/mdx-features/index.html 'client="load" opts="{&quot;name&quot;:&quot;Counter&quot;'
island_urls=$(docker exec "$container" grep -oE '(component|renderer)-url="[^"]+"' /out/mdx-features/index.html | cut -d'"' -f2)
check "mdx-features: island names its component and renderer scripts" equals "$(wc -l <<<"$island_urls")" 2
for url in $island_urls; do
  check "mdx-features: island script $url exists" file_exists "/out/mdx-features$url"
done

build /work/bad-import /out/bad-import
check "bad-import: exits 1" equals "$code" 1
check "bad-import: error names the missing package and the page under content/" \
  grep -qF 'Rolldown failed to resolve import \"canvas-confetti\" from \"content/index.mdx\"' <<<"$(tail -n1 <<<"$stdout")"
check "bad-import: error has no template paths or color codes" \
  equals "$(tail -n1 <<<"$stdout" | grep -cE 'src/content/docs|\\u001b')" 0
check "bad-import: writes no output" file_missing /out/bad-import

build /work/bad-links /out/bad-links
check "bad-links: exits 1" equals "$code" 1
check "bad-links: stderr lists missing pages and logo" equals "$stderr" "docs.config.json: logo assets/missing.svg does not exist
docs.config.json: navigation[1].items[0].href points to no page in content/"

build /work/broken-link /out/broken-link
check "broken-link: Nimbus lint fails the build" equals "$code" 1
check "broken-link: the error names the page, the rule and the link" grep -qF 'content/index.mdx:5:10  error  nimbus/internal-link' <<<"$stdout"
check "broken-link: writes no output" file_missing /out/broken-link

docker exec "$container" sh -c 'mkdir -p /tmp/m/sub && printf hello >/tmp/m/a.txt && printf hello >/tmp/m/b.css && : >/tmp/m/sub/c.html'
check "dist-manifest: path, size and a hash that differs by extension" equals \
  "$(docker exec "$container" env -i PATH=/usr/local/bin:/usr/bin:/bin dist-manifest /tmp/m)" \
  '[{"path":"/a.txt","size":5,"hash":"6557d84ac976d6185b43efbc8df3d80c"},{"path":"/b.css","size":5,"hash":"e72a1a0559528439e25f634b1f20f825"},{"path":"/sub/c.html","size":0,"hash":"e5e239560bc125a20ff2ac1fea50915b"}]'
check "dist-manifest: lists a built page" \
  grep -qF '"path":"/guides/setup/index.html"' <<<"$(docker exec "$container" dist-manifest /out/good)"

echo
echo "image size: $(docker image inspect "$image" --format '{{.Size}}' | awk '{printf "%.0f MB", $1 / 1000000}')"
echo "good build, first in a fresh container: ${cold}s"
echo "good build, second in the same container: ${warm}s"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
