const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check for SpacetimeDB CLI
try {
  console.log("Checking for SpacetimeDB installation...");
  const version = execSync('spacetime --version').toString().trim();
  console.log(`Found SpacetimeDB: ${version}`);
} catch (error) {
  console.error("SpacetimeDB CLI not found! Please install it first:");
  console.error("Windows: iwr https://windows.spacetimedb.com -useb | iex");
  console.error("MacOS/Linux: curl -sSf https://install.spacetimedb.com | sh");
  process.exit(1);
}

// Check if SpacetimeDB is running
try {
  console.log("Checking if SpacetimeDB is running...");
  execSync('spacetime status');
  console.log("SpacetimeDB is running");
} catch (error) {
  console.log("Starting SpacetimeDB...");
  try {
    execSync('spacetime start');
    console.log("SpacetimeDB started successfully");
  } catch (startError) {
    console.error("Failed to start SpacetimeDB:", startError.message);
    process.exit(1);
  }
}

// Install API dependencies
console.log("Installing API dependencies...");
try {
  process.chdir(path.join(__dirname, '../api'));
  execSync('npm install', { stdio: 'inherit' });
  console.log("API dependencies installed successfully");
} catch (error) {
  console.error("Failed to install API dependencies:", error.message);
  process.exit(1);
}

// Check if Rust is installed for SpacetimeDB module compilation
try {
  console.log("Checking for Rust installation...");
  const rustVersion = execSync('rustc --version').toString().trim();
  console.log(`Found Rust: ${rustVersion}`);
} catch (error) {
  console.error("Rust not found! Please install Rust:");
  console.error("Visit https://rustup.rs/ for installation instructions");
  process.exit(1);
}

console.log("Setup completed successfully!");
console.log("\nNext steps:");
console.log("1. Compile and publish the SpacetimeDB module:");
console.log("   cd ../spacetime/analytics && spacetime publish");
console.log("2. Start the API bridge:");
console.log("   cd ../api && npm start");
console.log("3. Connect your frontend to http://localhost:3001"); 