const babel = require('@babel/core');
const fs = require('fs');

const code = fs.readFileSync('/Users/shashiprakashmaurya/Desktop/HACK/NyayaSetu/app/(tabs)/explore.tsx', 'utf8');

try {
  const result = babel.transformSync(code, {
    filename: '/Users/shashiprakashmaurya/Desktop/HACK/NyayaSetu/app/(tabs)/explore.tsx',
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }]
    ],
    plugins: [
      ['babel-plugin-react-compiler', { compilationMode: 'infer' }]
    ]
  });
  console.log("Success with react-compiler");
} catch (e) {
  console.error("Error with react-compiler:", e.message);
}
