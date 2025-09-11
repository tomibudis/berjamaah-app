const fs = require('fs');
const path = require('path');

function copyPrismaBinary() {
  const prismaGeneratedPath = path.join(process.cwd(), 'prisma', 'generated');
  const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
  const sourcePath = path.join(prismaGeneratedPath, binaryName);

  // Create target directories
  const targets = [
    path.join(process.cwd(), '.next', 'server', 'chunks'),
    path.join(
      process.cwd(),
      '.next',
      'standalone',
      'apps',
      'server',
      'prisma',
      'generated'
    ),
    path.join(
      process.cwd(),
      '.next',
      'standalone',
      'apps',
      'server',
      '.next',
      'server',
      'chunks'
    ),
  ];

  if (fs.existsSync(sourcePath)) {
    console.log(`📦 Found Prisma binary at: ${sourcePath}`);

    targets.forEach(targetDir => {
      try {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, binaryName);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied Prisma binary to: ${targetPath}`);
      } catch (error) {
        console.warn(`⚠️ Failed to copy to ${targetDir}:`, error.message);
      }
    });

    console.log('🎉 Prisma binary copying completed!');
  } else {
    console.error(`❌ Prisma binary not found at: ${sourcePath}`);
    console.log('💡 Make sure to run "npx prisma generate" first');
    process.exit(1);
  }
}

copyPrismaBinary();
