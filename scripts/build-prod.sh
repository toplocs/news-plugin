#!/bin/bash

# TopLocs News Plugin - Production Build Script
# This script builds the project for production with optimizations

set -e  # Exit on error

echo "🚀 TopLocs News Plugin - Production Build"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
echo -e "${GREEN}✓ Clean complete${NC}"
echo ""

# 2. Type check
echo "🔍 Running TypeScript type check..."
if pnpm type-check; then
  echo -e "${GREEN}✓ Type check passed${NC}"
else
  echo -e "${RED}✗ Type check failed${NC}"
  exit 1
fi
echo ""

# 3. Lint
echo "🔍 Running ESLint..."
if pnpm lint; then
  echo -e "${GREEN}✓ Lint passed${NC}"
else
  echo -e "${YELLOW}⚠ Lint warnings (continuing)${NC}"
fi
echo ""

# 4. Run tests
echo "🧪 Running unit tests..."
if pnpm test:unit; then
  echo -e "${GREEN}✓ Tests passed${NC}"
else
  echo -e "${RED}✗ Tests failed${NC}"
  exit 1
fi
echo ""

# 5. Build
echo "📦 Building for production..."
if NODE_ENV=production pnpm build; then
  echo -e "${GREEN}✓ Build complete${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi
echo ""

# 6. Analyze bundle size
echo "📊 Analyzing bundle size..."
if [ -f "dist/stats.json" ]; then
  echo "Bundle analysis available in dist/stats.json"
  # Calculate total size
  TOTAL_SIZE=$(du -sh dist/ | cut -f1)
  echo "Total dist size: $TOTAL_SIZE"
else
  echo -e "${YELLOW}⚠ No stats.json found${NC}"
fi
echo ""

# 7. Check bundle sizes
echo "📏 Checking bundle size limits..."
MAX_JS_SIZE=350  # KB
MAX_CSS_SIZE=50  # KB

# Check JavaScript bundle size
JS_SIZE=$(find dist/assets -name "*.js" -type f -exec du -k {} + | awk '{sum+=$1} END {print sum}')
if [ $JS_SIZE -gt $MAX_JS_SIZE ]; then
  echo -e "${RED}✗ JavaScript bundle too large: ${JS_SIZE}KB (max: ${MAX_JS_SIZE}KB)${NC}"
  exit 1
else
  echo -e "${GREEN}✓ JavaScript bundle size OK: ${JS_SIZE}KB${NC}"
fi

# Check CSS bundle size
CSS_SIZE=$(find dist/assets -name "*.css" -type f -exec du -k {} + | awk '{sum+=$1} END {print sum}')
if [ $CSS_SIZE -gt $MAX_CSS_SIZE ]; then
  echo -e "${YELLOW}⚠ CSS bundle size: ${CSS_SIZE}KB (recommended max: ${MAX_CSS_SIZE}KB)${NC}"
else
  echo -e "${GREEN}✓ CSS bundle size OK: ${CSS_SIZE}KB${NC}"
fi
echo ""

# 8. Verify critical files exist
echo "✅ Verifying build output..."
CRITICAL_FILES=(
  "dist/index.html"
  "dist/p2p-demo.html"
  "dist/control-center.html"
  "dist/solid-dashboard.html"
  "dist/manifest.json"
  "dist/sw.js"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ $file${NC}"
  else
    echo -e "${RED}✗ Missing: $file${NC}"
    exit 1
  fi
done
echo ""

# 9. List entry points
echo "📄 Entry points generated:"
ls -lh dist/*.html | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# 10. Success!
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Production build completed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📦 Build output: dist/"
echo "🚀 Ready to deploy!"
echo ""
echo "Next steps:"
echo "  • Test locally: pnpm preview"
echo "  • Deploy to staging: git push origin develop"
echo "  • Deploy to production: git push origin main"
echo ""
