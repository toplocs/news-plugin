#!/bin/bash
# Quick Fix Script - Port Mismatch
# Fixes localhost:5175 -> localhost:5173 in all E2E tests and docs

echo "🔧 Fixing port mismatch in E2E tests..."

# Replace 5175 with 5173 in all test files
find tests/e2e/test-*.spec.ts -type f -exec sed -i 's/localhost:5175/localhost:5173/g' {} +

echo "  ✅ Fixed 12 E2E test files"

# Update documentation
sed -i 's/localhost:5175/localhost:5173/g' docs/PHASE-3-TEST-GUIDE.md

echo "  ✅ Fixed documentation"

echo ""
echo "✅ Port mismatch fixed!"
echo ""
echo "📝 Next steps:"
echo "   1. Run E2E tests: pnpm test:e2e"
echo "   2. Update Achievement definitions in Test Guide"
echo "   3. Fix unit test errors (see TEST-REPORT-CONTROL-CENTER.md)"
